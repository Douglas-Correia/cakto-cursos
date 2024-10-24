import { HStack, Input } from "@chakra-ui/react";
import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface InputPasswordProps {
    placeholder: string;
    register?: UseFormRegisterReturn;
}

export function InputPassword({ placeholder, register }: InputPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <HStack position="relative" w="full">
            <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                h={12}
                pr={14}
                {...register}
            />
            <HStack
                style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: 16,
                    zIndex: 99,
                }}
            >
                {showPassword ? (
                    <FiEye size={22} onClick={handleShowPassword} />
                ) : (
                    <FiEyeOff size={22} onClick={handleShowPassword} />
                )}
            </HStack>
        </HStack>
    );
}
