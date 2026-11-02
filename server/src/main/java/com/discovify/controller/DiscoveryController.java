package com.discovify.controller;

import com.discovify.result.Result;
import com.discovify.service.DiscoveryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/song")
public class DiscoveryController {
    private final DiscoveryService discovery;
    public DiscoveryController(DiscoveryService discovery) { this.discovery=discovery; }
    public record DiscoverInput(@NotNull @Size(max=200) String intent) { }
    public record ListenInput(@Positive long songId, @NotBlank @Pattern(regexp="[a-zA-Z0-9-]{16,64}") String eventId,
                              @Min(30) @Max(86400) int listenedSeconds) { }
    @PostMapping("/discover")
    public Result<Map<String,Object>> discover(@Valid @RequestBody DiscoverInput input,HttpServletRequest request) {
        return Result.success(discovery.discover(discovery.userId(request),input.intent()));
    }
    @PostMapping("/listening-event")
    public Result<Boolean> listen(@Valid @RequestBody ListenInput input,HttpServletRequest request) {
        discovery.record(discovery.userId(request),input.songId(),input.eventId(),input.listenedSeconds());
        return Result.success(true);
    }
}
