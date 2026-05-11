<?php

return [
    //
    'enabled' => env('ACTIVITY_LOGGER_ENABLED', true),

    'delete_records_older_than_days' => 365,

    'default_log_name' => 'default',

    'activity_model' => \Spatie\ActivityLog\Models\Activity::class,

    'table_name' => env('ACTIVITY_LOGGER_TABLE', 'activity_log'),

    'database_connection' => env('ACTIVITY_LOGGER_DB_CONNECTION', null),

    'subject_returns_soft_deleted_models' => false,
];
