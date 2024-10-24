import {
  ThemeConfig,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const variantOutlined = () => ({
  field: {
    _focus: {
      borderColor: "var(--chakra-ui-focus-ring-color)",
      boxShadow: "0 0 0 2px var(--chakra-ui-focus-ring-color)",
    },
  },
});

const variantFilled = () => ({
  field: {
    _focus: {
      borderColor: "var(--chakra-ui-focus-ring-color)",
      boxShadow: "0 0 0 1px var(--chakra-ui-focus-ring-color)",
    },
  },
});

const variantFlushed = () => ({
  field: {
    _focus: {
      borderColor: "var(--chakra-ui-focus-ring-color)",
      boxShadow: "0 1px 0 0 var(--chakra-ui-focus-ring-color)",
    },
  },
});

const theme = extendTheme(
  withDefaultColorScheme({
    colorScheme: "primary",
    components: ["Button", "Badge", "Tag", "Switch", "Checkbox"],
  }),
  {
    config,
    colors: {
      primary: {
        "50": "#f9f6fd",
        "100": "#e5daf8",
        "200": "#d3bef4",
        "300": "#b795ec",
        "400": "#a379e7",
        "500": "#8952e0",
        "600": "#7434db",
        "700": "#6023c0",
        "800": "#4f1d9e",
        "900": "#3b1676",
      },
    },
    styles: {
      global: {
        ":host,:root": {
          "--chakra-ui-focus-ring-color": "var(--chakra-colors-primary-600)",
        },
      },
    },
    components: {
      Input: {
        variants: {
          outline: variantOutlined,
          filled: variantFilled,
          flushed: variantFlushed,
        },
      },
      Select: {
        variants: {
          outline: variantOutlined,
          filled: variantFilled,
          flushed: variantFlushed,
        },
      },
      Textarea: {
        variants: {
          outline: () => variantOutlined().field,
          filled: () => variantFilled().field,
          flushed: () => variantFlushed().field,
        },
      },
    },
  }
);

export default theme;
