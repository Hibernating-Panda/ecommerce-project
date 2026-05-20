import React from "react";
import { Outlet } from "react-router-dom";
import ShopOwnerSidebar from "../../components/shopowner/ShopOwnerSidebar";
import { roleThemes } from "../../theme/roleThemes";

function ShopOwnerLayout() {
  const theme = roleThemes.shop_owner;

  return (
    <div style={{ ...styles.page, backgroundColor: theme.bg }}>
      <ShopOwnerSidebar theme={theme} />

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
  },
  content: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    padding: "clamp(70px, 4vw, 32px) clamp(16px, 2.5vw, 32px)",
    marginLeft: "260px",
    boxSizing: "border-box",
  },
};

const responsiveStyle = document.createElement("style");
responsiveStyle.innerHTML = `
  @media (max-width: 900px) {
    main[style] {
      margin-left: 0 !important;
    }
  }
`;
document.head.appendChild(responsiveStyle);

export default ShopOwnerLayout;