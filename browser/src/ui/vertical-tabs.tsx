import { useEffect, useRef } from "react";
import { Box, Image, Text } from "@zenbu-labs/pixel";
import type { NodeHandle } from "@zenbu-labs/pixel";
import { Icon } from "./icons";
import { ScrollPane } from "./settings/scroll-pane";
import type { ChromeActions, ChromeLayout, TabRow } from "./types";
import type { Theme } from "./theme";

export function VerticalTabs({ tabs, actions, layout, theme }: {
  tabs: TabRow[];
  actions: ChromeActions;
  layout: ChromeLayout;
  theme: Theme;
}) {
  const rem = layout.rem;
  const active = useRef<NodeHandle | null>(null);
  const activeId = tabs.find((tab) => tab.active)?.id;
  useEffect(() => {
    active.current?.scrollIntoView();
  }, [activeId, tabs.length]);
  return (
    <Box
      style={{
        position: "absolute",
        inset: { top: layout.toolbarHeight, left: 0 },
        width: layout.sidebarWidth,
        height: layout.contentHeight,
        flexDirection: "column",
        padding: rem * 0.35,
        gap: rem * 0.3,
      }}
    >
      <ScrollPane rem={rem} resetKey={0} style={{ flexGrow: 1, flexBasis: 0, flexDirection: "column", gap: rem * 0.25 }}>
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            ref={tab.active ? active : undefined}
            style={{
              height: rem * 2.2,
              flexShrink: 0,
              alignItems: "center",
              gap: rem * 0.4,
              padding: rem * 0.45,
              cornerRadius: rem * 0.35,
              background: tab.active ? theme.hover : undefined,
              hoverBackground: theme.hover,
            }}
            onClick={() => actions.tabSwitch(tab.id)}
          >
            {tab.favicon ? (
              <Image src={tab.favicon} error={<Box />} style={{ width: rem, height: rem, flexShrink: 0 }} />
            ) : (
              <Box style={{ width: rem, height: rem, flexShrink: 0 }} />
            )}
            <Text
              style={{
                flexGrow: 1,
                flexBasis: 0,
                minWidth: 0,
                fontSize: rem * 0.82,
                wrap: false,
                ellipsis: true,
                selectable: false,
                overflow: "hidden",
                color: tab.agentControlled ? theme.accent : tab.active ? theme.fg : theme.muted,
              }}
            >
              {tab.title || "New tab"}
            </Text>
            <Box
              style={{
                width: rem * 1.2,
                height: rem * 1.2,
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                cornerRadius: rem * 0.2,
                hoverBackground: theme.hoverStrong,
              }}
              onClick={() => actions.tabClose(tab.id)}
            >
              <Icon icon="close" size={rem * 0.8} color={theme.muted} />
            </Box>
          </Box>
        ))}
      </ScrollPane>
      <Box
        style={{
          height: rem * 2,
          flexShrink: 0,
          alignItems: "center",
          gap: rem * 0.5,
          padding: rem * 0.45,
          cornerRadius: rem * 0.35,
          hoverBackground: theme.hover,
        }}
        onClick={actions.tabNew}
      >
        <Icon icon="plus" size={rem} color={theme.muted} />
        <Text style={{ fontSize: rem * 0.82, selectable: false }}>New tab</Text>
      </Box>
    </Box>
  );
}
