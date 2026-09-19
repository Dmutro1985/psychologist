<?php
/**
 * Повертає офіційний курс НБУ (USD, EUR) у форматі JSON.
 * Кешує результат на добу в локальному файлі, щоб не смикати
 * НБУ при кожному відкритті сторінки цін.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://hranevska.com.ua');

error_reporting(0);
ini_set('display_errors', '0');

$cacheFile = __DIR__ . '/nbu-rates-cache.json';
$today = date('Y-m-d');

// 1. Якщо є свіжий кеш за сьогодні — віддаємо його одразу
if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if (is_array($cached) && ($cached['date'] ?? '') === $today) {
        echo json_encode($cached);
        exit;
    }
}

// 2. Інакше — свіжий запит до НБУ
function fetch_nbu_rate($valcode) {
    $url = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json&valcode={$valcode}";
    $result = false;

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; hranevska.com.ua price widget)');
        $result = curl_exec($ch);
        curl_close($ch);
    } elseif (ini_get('allow_url_fopen')) {
        $context = stream_context_create(['http' => ['timeout' => 6, 'header' => "User-Agent: Mozilla/5.0\r\n"]]);
        $result = @file_get_contents($url, false, $context);
    }

    if ($result === false) {
        return null;
    }
    $data = json_decode($result, true);
    if (!is_array($data) || empty($data[0]['rate'])) {
        return null;
    }
    return (float) $data[0]['rate'];
}

$usd = fetch_nbu_rate('usd');
$eur = fetch_nbu_rate('eur');

if ($usd && $eur) {
    $payload = ['date' => $today, 'usd' => $usd, 'eur' => $eur];
    @file_put_contents($cacheFile, json_encode($payload));
    echo json_encode($payload);
    exit;
}

// 3. НБУ недоступний і кешу немає — віддаємо застарілий кеш, якщо він є,
//    інакше orієнтовні резервні значення, щоб сторінка не зламалась.
if (file_exists($cacheFile)) {
    echo file_get_contents($cacheFile);
    exit;
}

echo json_encode(['date' => null, 'usd' => 41.5, 'eur' => 45.0, 'fallback' => true]);
