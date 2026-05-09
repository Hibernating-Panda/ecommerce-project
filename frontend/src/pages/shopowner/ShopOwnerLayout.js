import React from "react";
import { Outlet } from "react-router-dom";
import ShopOwnerSidebar from "../../components/shopowner/ShopOwnerSidebar";

function ShopOwnerLayout() {
  return (
    <div style={styles.page}>
      <ShopOwnerSidebar />

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
  },
  content: {
    marginLeft: "270px",
    padding: "30px",
    width: "100%",
  },
};

export default ShopOwnerLayout;