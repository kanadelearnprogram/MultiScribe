CREATE TABLE `image_cache` (
                               `cacheKey` varchar(64) NOT NULL COMMENT 'MD5唯一缓存Key',
                               `sourceType` varchar(32) NOT NULL COMMENT '图片类型',
                               `keywords` varchar(1024) DEFAULT '' COMMENT '搜索关键词',
                               `prompt` text DEFAULT NULL COMMENT '提示词/流程图代码',
                               `cosUrl` varchar(512) NOT NULL COMMENT 'COS图片地址',
                               `isFallback` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=正常 1=降级图片',
                               `hitCount` int NOT NULL DEFAULT 0 COMMENT '缓存命中次数',
                               PRIMARY KEY (`cacheKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片缓存表';