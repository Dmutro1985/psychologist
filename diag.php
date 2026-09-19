<?php
/**
 * Тимчасовий діагностичний файл. Показує, які можливості PHP доступні
 * на хостингу — допомагає зрозуміти, чому форма/бот можуть не працювати.
 * Видаліть цей файл після того, як проблему буде вирішено.
 */
header('Content-Type: text/plain; charset=utf-8');

echo "PHP версія: " . phpversion() . "\n\n";
echo "curl_init доступний: " . (function_exists('curl_init') ? 'ТАК' : 'НІ') . "\n";
echo "allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'ТАК' : 'НІ') . "\n";
echo "mail() функція доступна: " . (function_exists('mail') ? 'ТАК' : 'НІ') . "\n\n";

echo "--- Тест з'єднання з Telegram API ---\n";
$botToken = '8859232348:AAEZrFOHHIBLJX5gl5wjXW46E9s8gXA0SIc';
$url = "https://api.telegram.org/bot{$botToken}/getMe";

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $result = curl_exec($ch);
    $err = curl_error($ch);
    $errno = curl_errno($ch);
    curl_close($ch);
    if ($result !== false) {
        echo "curl-запит успішний. Відповідь Telegram:\n$result\n";
    } else {
        echo "curl-запит НЕ вдався. Помилка ($errno): $err\n";
    }
} elseif (ini_get('allow_url_fopen')) {
    $result = @file_get_contents($url);
    if ($result !== false) {
        echo "file_get_contents-запит успішний. Відповідь Telegram:\n$result\n";
    } else {
        echo "file_get_contents-запит НЕ вдався (можливо, зовнішні з'єднання заблоковані хостингом).\n";
    }
} else {
    echo "Немає жодного способу зробити зовнішній HTTP-запит (ні curl, ні allow_url_fopen).\n";
}
