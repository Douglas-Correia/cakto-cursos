import { Lesson } from '@/features/course/types';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { BoxProps, Card, CardBody, HStack, Heading, Icon, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiCircle } from 'react-icons/fi';

type Props = BoxProps & {
  lesson: Lesson;
};

const LessonCard: React.FC<Props> = ({ lesson: { cover, name, completed }, ...props }) => {
  return (
    <Card
      overflow="hidden"
      rounded="lg"
      as={motion.div}
      whileHover={{ scale: 1.02 }}
      cursor="pointer"
      border="none"
      position="relative"
      variant="outline"
      {...props}
    >
      <Image src={cover} alt={name} w="full" h={200} objectFit="cover" />
      <CardBody>
        <HStack justify="space-between" align="center" flexWrap="wrap">
          <Heading size="sm" noOfLines={2}>
            {name}
          </Heading>
          {completed ? (
            <Icon as={CheckCircleIcon} color="green.500" />
          ) : (
            <Icon as={FiCircle} color="gray.500" />
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};

export default LessonCard;
