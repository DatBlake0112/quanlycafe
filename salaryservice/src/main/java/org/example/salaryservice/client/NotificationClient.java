package org.example.salaryservice.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(String maNV, String tieuDe, String noiDung, String loai, String refId) {
        String url = "http://localhost:8083/api/notifications/create";

        Map<String, Object> body = new HashMap<>();
        body.put("maNhanVien", maNV);
        body.put("tieuDe", tieuDe);
        body.put("noiDung", noiDung);
        body.put("loaiThongBao", loai);
        body.put("idThamChieu", refId);

        try {
            restTemplate.postForObject(url, body, Void.class);
        } catch (Exception e) {
            System.out.println("Lỗi gửi notification: " + e.getMessage());
        }
    }
}
