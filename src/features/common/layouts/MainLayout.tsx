import Header from "@/features/common/components/layout/Header";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <Header zIndex={1} position="absolute" w="full" />
      <Box overflow="auto" pt={20}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
