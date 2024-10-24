import { HStack, Icon, IconProps } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { FaStar } from "react-icons/fa6";

type Props = {
  defaultRating: number;
  onChange: (rating: number) => void;
} & Omit<IconProps, "onChange">;

const LessonRating: React.FC<Props> = ({
  defaultRating,
  onChange,
  ...props
}) => {
  const [hover, setHover] = React.useState<number | null>(null);

  const [rating, setRating] = React.useState<number>(defaultRating);

  useEffect(() => {
    setRating(defaultRating);
  }, [defaultRating]);

  return (
    <HStack>
      {[...Array(5)].map((_, index) => (
        <Icon
          key={index}
          as={FaStar}
          _hover={{ color: "primary.500" }}
          transition="color 0.3s"
          color={index < (hover ?? rating) ? "primary.500" : "gray.300"}
          onClick={() => {
            setRating(index + 1);
            onChange(index + 1);
          }}
          onMouseEnter={() => setHover(index)}
          onMouseLeave={() => setHover(null)}
          fontSize="xl"
          cursor="pointer"
          {...props}
        />
      ))}
    </HStack>
  );
};

export default LessonRating;
