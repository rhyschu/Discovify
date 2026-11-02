package com.discovify.service;

public interface EmailService {
    boolean sendEmail(String to, String subject, String content);
    String sendVerificationCodeEmail(String email);
}
