package com.discovify.service;

import com.discovify.model.dto.*;
import com.discovify.model.entity.User;
import com.discovify.model.vo.UserManagementVO;
import com.discovify.model.vo.UserVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface IUserService extends IService<User> {
    Result sendVerificationCode(String email);
    boolean verifyVerificationCode(String email, String verificationCode);
    Result register(UserRegisterDTO userRegisterDTO);
    Result login(UserLoginDTO userLoginDTO);
    Result<UserVO> userInfo();
    Result updateUserInfo(UserDTO userDTO);
    Result updateUserAvatar(String avatarUrl);
    Result updateUserPassword(UserPasswordDTO userPasswordDTO, String token);
    Result resetUserPassword(UserResetPasswordDTO userResetPasswordDTO);
    Result logout(String token);
    Result deleteAccount();
    Result<Long> getAllUsersCount();
    Result<PageResult<UserManagementVO>> getAllUsers(UserSearchDTO userSearchDTO);
    Result addUser(UserAddDTO userAddDTO);
    Result updateUser(UserDTO userDTO);
    Result updateUserStatus(Long userId, Integer userStatus);
    Result deleteUser(Long userId);
    Result deleteUsers(List<Long> userIds);
}
