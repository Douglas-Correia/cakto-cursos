import { BoxProps, Flex } from "@chakra-ui/react";

type Props = BoxProps;

const FlexCenter: React.FC<Props> = (props) => (
  <Flex justify="center" align="center" {...props} />
);

export default FlexCenter;
