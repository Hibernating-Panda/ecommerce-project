import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ShopOwnerSidebar from "../../components/shopowner/ShopOwnerSidebar";
import { roleThemes } from "../../theme/roleThemes";

function ShopOwnerLayout() {
  const theme = roleThemes.shop_owner;

  useEffect(() => {
    const styleId = "shopowner-layout-responsive-style";

    if (document.getElementById(styleId)) return;

    const responsiveStyle = document.createElement("style");
    responsiveStyle.id = styleId;
    responsiveStyle.innerHTML = `
      @media (max-width: 900px) {
        .shopowner-main-content {
          margin-left: 0 !important;
          padding-top: 70px !important;
        }
      }
    `;

    document.head.appendChild(responsiveStyle);
  }, []);

  return (
    <div style={{ ...styles.page, backgroundColor: theme.bg }}>
      <ShopOwnerSidebar theme={theme} />

      <main className="shopowner-main-content" style={styles.content}>
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

export default ShopOwnerLayout;