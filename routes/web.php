<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/users', function () {
        return Inertia::render('users/index');
    })->name('users');

    Route::get('/messages', function () {
        return Inertia::render('messages/index');
    })->name('messages');

    Route::get('/announcements', function () {
        return Inertia::render('announcements/index');
    })->name('announcements');

    Route::get('/announcements/create', function () {
        return Inertia::render('announcements/create');
    })->name('announcements.create');

    Route::get('/announcements/{id}/edit', function (string $id) {
        return Inertia::render('announcements/edit', [
            'id' => $id
        ]);
    })->name('announcements.edit');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
