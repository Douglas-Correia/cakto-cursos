import { useVideoPlaybackRate } from '@/features/course/hooks/UseVideoPlaybackRate';
import { useVideoQuality } from '@/features/course/hooks/UseVideoQuality';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, Icon, SettingsIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import { memo, useRef, useState } from 'react';

enum SettingsOptions {
  NONE = 'NONE',
  QUALITY = 'QUALITY',
  SPEED = 'SPEED',
}

const VideoSettingsPopover: React.FC = () => {
  const menu = useDisclosure();

  const [option, setOption] = useState<SettingsOptions>(SettingsOptions.NONE);

  const { quality, changeQuality, qualities } = useVideoQuality();

  const { PlaybackRates, playbackRate, setPlaybackRate } = useVideoPlaybackRate();

  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    menu.onClose();
    setTimeout(() => {
      setOption(SettingsOptions.NONE);
    }, 500);
  };

  useOutsideClick({
    ref: menuRef,
    handler: closeMenu,
  });

  return (
    <>
      <Popover
        placement="top-end"
        closeOnBlur={false}
        closeOnEsc
        trigger="click"
        offset={[0, 12]}
        isOpen={menu.isOpen}
        onOpen={menu.onOpen}
        onClose={menu.onClose}
      >
        <PopoverTrigger>
          <Box position="relative">
            <IconButton
              aria-label="settings"
              icon={<Icon as={SettingsIcon} color={'primary.300'} />}
              colorScheme="primary"
              size={{
                base: 'xs',
                sm: 'sm',
              }}
              variant="text"
            />
            {qualities[quality]?.hd && (
              <Badge
                colorScheme="red"
                fontSize={'3xs'}
                rounded="md"
                px={1}
                position="absolute"
                top={0}
                right={0}
              >
                HD
              </Badge>
            )}
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            border="none"
            bg="rgba(0, 0, 0, 0.7)"
            minWidth="150px"
            style={{
              backdropFilter: 'blur(10px)',
            }}
            rounded="lg"
          >
            <PopoverBody>
              <Stack ref={menuRef} gap={1}>
                {option === SettingsOptions.NONE ? (
                  <>
                    <Button
                      onClick={() => setOption(SettingsOptions.SPEED)}
                      colorScheme="gray"
                      size="sm"
                      variant="ghost"
                    >
                      <HStack alignItems="center" w="full">
                        <Text flex={1} textAlign="start" fontSize="xs" fontWeight="bold">
                          Velocidade
                        </Text>
                        <Text fontSize={'2xs'} color="gray.300" letterSpacing={0.5}>
                          {playbackRate?.label || 'Normal'}
                        </Text>
                        <Icon as={ChevronRightIcon} color={'gray.300'} />
                      </HStack>
                    </Button>
                    <Button
                      onClick={() => setOption(SettingsOptions.QUALITY)}
                      colorScheme="gray"
                      size="sm"
                      variant="ghost"
                    >
                      <HStack alignItems="center" w="full">
                        <Text flex={1} textAlign="start" fontSize="xs" fontWeight="bold">
                          Qualidade
                        </Text>
                        <HStack alignItems="center" gap={0}>
                          <Text fontSize={'2xs'} color="gray.300">
                            {qualities[quality]?.label || 'Auto'}
                          </Text>
                          {qualities[quality]?.hd && (
                            <Badge colorScheme="red" mx={1} fontSize={'3xs'} rounded="md" px={1}>
                              HD
                            </Badge>
                          )}
                        </HStack>
                        <Icon as={ChevronRightIcon} color={'gray.300'} />
                      </HStack>
                    </Button>
                  </>
                ) : (
                  <Button
                    leftIcon={<Icon as={ChevronLeftIcon} color={'gray.300'} />}
                    colorScheme="gray"
                    size="xs"
                    variant="text"
                    onClick={() => setOption(SettingsOptions.NONE)}
                    my={2}
                  >
                    <Text fontWeight="bold" flex={1} textAlign="start">
                      Configurações
                    </Text>
                  </Button>
                )}
                {option === SettingsOptions.QUALITY && (
                  <>
                    {qualities.map(({ hd, label }, i) => (
                      <Button
                        w="full"
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuality(i);
                          closeMenu();
                        }}
                        colorScheme="gray"
                        size="sm"
                        variant="ghost"
                        {...(quality === i && { rightIcon: <CheckIcon boxSize={3} /> })}
                      >
                        <HStack alignItems="center" w="full">
                          <Text textAlign="start" fontSize="xs" fontWeight="bold">
                            {label}
                          </Text>
                          {hd && (
                            <Badge colorScheme="red" fontSize={'3xs'} rounded="md" px={1}>
                              HD
                            </Badge>
                          )}
                        </HStack>
                      </Button>
                    ))}
                  </>
                )}
                {option === SettingsOptions.SPEED && (
                  <>
                    {PlaybackRates.map(({ speed, label }, i) => (
                      <Button
                        w="full"
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackRate(speed);
                          closeMenu();
                        }}
                        colorScheme="gray"
                        size="sm"
                        variant="ghost"
                        {...(playbackRate?.speed === speed && {
                          rightIcon: <CheckIcon boxSize={3} />,
                        })}
                      >
                        <HStack alignItems="center" w="full">
                          <Text textAlign="start" fontSize="xs" fontWeight="bold">
                            {label}
                          </Text>
                        </HStack>
                      </Button>
                    ))}
                  </>
                )}
              </Stack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
};

export default memo(VideoSettingsPopover);
