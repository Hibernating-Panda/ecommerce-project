<?php

return [
    'show_warnings'          => false,
    'orientation'            => 'portrait',
    'defines'                => [],
    'pdf_backend'            => 'CPDF',
    'default_media_type'     => 'screen',
    'default_paper_size'     => 'a4',
    'default_paper_orientation' => 'portrait',
    'default_font'           => 'serif',
    'dpi'                    => 96,
    'enable_php'             => false,
    'enable_javascript'      => true,
    'enable_remote'          => false,
    'font_dir'               => storage_path('fonts/'),
    'font_cache'             => storage_path('fonts/'),
    'temp_dir'               => sys_get_temp_dir(),
    'chroot'                 => realpath(base_path()),
    'log_output_file'        => null,
    'options'                => [
        'font_dir'  => storage_path('fonts/'),
        'font_cache'=> storage_path('fonts/'),
        'temp_dir'  => sys_get_temp_dir(),
        'chroot'    => realpath(base_path()),
    ],
];
