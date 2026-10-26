<?php

use Illuminate\Support\Facades\Route;

/*
 * The Vue router owns every path; all data lives in the browser's localStorage.
 */
Route::view('/{any?}', 'app')->where('any', '^(?!up$).*$')->name('app');
