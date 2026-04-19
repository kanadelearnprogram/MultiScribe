package com.kanade.aipassage.service;

import org.springframework.stereotype.Service;

@Service
public class CosService {
    /**
     * 直接使用图片 URL（不上传到 COS）
     *
     * @param imageUrl 图片 URL
     * @return 图片 URL
     * @deprecated 使用 uploadImageData() 替代
     */
    @Deprecated
    public String useDirectUrl(String imageUrl) {
        return imageUrl;
    }

}
