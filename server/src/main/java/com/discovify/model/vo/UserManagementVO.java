package com.discovify.model.vo;

import com.discovify.enumeration.UserStatusEnum;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserManagementVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long userId;

    private String username;

    private String phone;

    private String email;

    private String userAvatar;

    private String introduction;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private UserStatusEnum userStatus;
}
