import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";

const ToggleThemeButton = () => {
  const { toggleColorMode } = useColorMode();

  return (
    <IconButton
      rounded="full"
      variant="ghost"
      aria-label="Toggle Theme"
      bg="#212B36"
      size="sm"
      icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
      onClick={() => {
        toggleColorMode();
      }}
    />
  );
};

export default ToggleThemeButton;
