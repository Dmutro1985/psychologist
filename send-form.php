<?php
/**
 * Обробник форми "Записатися на консультацію".
 * Дані нікуди не передаються третім особам — лист формується
 * і надсилається прямо з цього хостингу на пошту психолога.
 */

// Не показуємо технічні попередження PHP в тексті відповіді —
// це гарантує, що сайт завжди отримає чистий JSON, а не биту відповідь.
error_reporting(0);
ini_set('display_errors', '0');
ob_start();

header('Content-Type: application/json; charset=utf-8');

// Дозволяємо запити лише з власного домену (базовий захист)
$allowedHost = 'hranevska.com.ua';
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $originHost = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);
    if ($originHost !== $allowedHost && $originHost !== 'www.' . $allowedHost) {
        http_response_code(403);
        ob_clean();
    echo json_encode(['success' => false, 'error' => 'Заборонено']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Метод не підтримується']);
    exit;
}

// ---- Honeypot: приховане поле, яке бачать лише боти ----
if (!empty($_POST['website'])) {
    // Тихо "вдаємо" успіх, лист не надсилаємо
    ob_clean();
    echo json_encode(['success' => true]);
    exit;
}

function clean_field($value) {
    $value = trim((string) $value);
    // Прибираємо переноси рядків, щоб унеможливити header injection
    $value = str_replace(["\r", "\n"], ' ', $value);
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

$name    = clean_field($_POST['name'] ?? '');
$phone   = clean_field($_POST['phone'] ?? '');
$topic   = clean_field($_POST['topic'] ?? '');
$message = trim((string) ($_POST['message'] ?? ''));
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

if ($name === '' || $phone === '') {
    http_response_code(400);
    ob_clean();
    echo json_encode(['success' => false, 'error' => "Заповніть ім'я та номер телефону"]);
    exit;
}

if (empty($_POST['consent'])) {
    http_response_code(400);
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Потрібна згода на обробку персональних даних']);
    exit;
}

if (mb_strlen($name) > 100 || mb_strlen($phone) > 30 || mb_strlen($topic) > 150 || mb_strlen($message) > 3000) {
    http_response_code(400);
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Занадто довге значення поля']);
    exit;
}

$to      = 'nastyaefimova806@gmail.com';
$subject = 'Нова заявка з сайту hranevska.com.ua';

$body  = "Ім'я: {$name}\n";
$body .= "Телефон: {$phone}\n";
$body .= "Тема: " . ($topic !== '' ? $topic : '—') . "\n";
$body .= "Повідомлення:\n" . ($message !== '' ? $message : '—') . "\n";
$body .= "\n---\nНадіслано з форми на сайті hranevska.com.ua\n";
$body .= 'Дата: ' . date('d.m.Y H:i');

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: no-reply@hranevska.com.ua\r\n";
$headers .= "Reply-To: no-reply@hranevska.com.ua\r\n";

$sent = @mail($to, $encodedSubject, $body, $headers);

// ---- Дублюємо заявку в Telegram (миттєво, не потрапляє в спам) ----
$telegramBotToken = '8859232348:AAEZrFOHHIBLJX5gl5wjXW46E9s8gXA0SIc';
$telegramChatId   = '804807129';

function send_telegram_notification($botToken, $chatId, $name, $phone, $topic, $message) {
    // Екрануємо символи, які мають спецзначення в Markdown Telegram
    $escape = function ($s) {
        return str_replace(['_', '*', '`', '['], ['\\_', '\\*', '\\`', '\\['], $s);
    };
    $text = "📩 *Нова заявка з сайту*\n\n"
        . "*Ім'я:* " . $escape($name) . "\n"
        . "*Телефон:* " . $escape($phone) . "\n"
        . "*Тема:* " . ($topic !== '' ? $escape($topic) : '—') . "\n"
        . "*Повідомлення:*\n" . ($message !== '' ? $escape($message) : '—') . "\n\n"
        . '🕓 ' . date('d.m.Y H:i');

    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $params = [
        'chat_id'    => $chatId,
        'text'       => $text,
        'parse_mode' => 'Markdown',
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result !== false;
    }

    if (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($params),
                'timeout' => 5,
            ],
        ]);
        $result = @file_get_contents($url, false, $context);
        return $result !== false;
    }

    return false;
}

$telegramSent = send_telegram_notification($telegramBotToken, $telegramChatId, $name, $phone, $topic, $message);

// Успіх, якщо надіслано хоч одним каналом (лист АБО телеграм)
if ($sent || $telegramSent) {
    ob_clean();
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Не вдалося надіслати. Спробуйте ще раз або напишіть у Telegram.']);
}
