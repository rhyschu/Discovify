package com.discovify.service;

import com.discovify.model.dto.AdminDTO;
import com.discovify.model.entity.Admin;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IAdminService extends IService<Admin> {
    Result register(AdminDTO adminDTO);
    Result login(AdminDTO adminDTO);
    Result logout(String token);
}
