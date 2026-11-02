package com.discovify.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class FeedbackDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Integer pageNum;

    @NotNull
    private Integer pageSize;

    private String keyword;

}
