package com.discovify.util;

public class TypeConversionUtil {

    public static Long toLong(Object obj) {
        if (obj instanceof Long) {
            return (Long) obj;
        } else if (obj instanceof Integer) {
            return ((Integer) obj).longValue();
        } else {
            throw new IllegalArgumentException("Unsupported conversion type: " + obj.getClass());
        }
    }

}
