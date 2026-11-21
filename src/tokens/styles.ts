export const styles = {
  "paint/Gradient Leaf": {
    "type": "paint",
    "status": "available",
    "paintType": "gradient_linear",
    "angle": 90,
    "stops": [
      { "position": 0, "colour": { "$ref": "Primitives/Brand/Golden lime" } },
      { "position": 100, "colour": "#66730B" }
    ]
  },
  "paint/Gradient Rose": {
    "type": "paint",
    "status": "available",
    "paintType": "gradient_linear",
    "value": "linear-gradient(90deg, #FFEBEB 0%, #D7BAC0 100%)"
  },
  "paint/Gradient Croissant": {
    "type": "paint",
    "status": "unavailable",
    "paintType": "gradient_linear"
  },
  "paint/Gradient Scarlate": {
    "type": "paint",
    "status": "available",
    "paintType": "gradient_linear",
    "angle": 90,
    "stops": [
      { "position": 0, "colour": { "$ref": "Primitives/Brand/Red Scarlet" } },
      { "position": 100, "colour": { "$ref": "Primitives/Brand/Public (Old Rose)/Dark" } }
    ]
  },
  "paint/Button Gradient": {
    "type": "paint",
    "status": "unavailable",
    "paintType": "gradient_linear"
  },
  "paint/Bg Card": {
    "type": "paint",
    "status": "available",
    "paintType": "gradient_linear",
    "angle": 90,
    "stops": [
      { "position": 0, "colour": { "$ref": "User Profiles/Primary/Dark" } },
      { "position": 100, "colour": { "$ref": "Primitives/Neutral/Black" } }
    ]
  },
  "text/Hero Title": {
    "type": "text",
    "fontFamily": "Roca",
    "fontWeight": "700",
    "fontSize": "60px",
    "letterSpacing": "0%"
  },
  "text/Hero Subtitle": {
    "type": "text",
    "fontFamily": "Roca",
    "fontWeight": "700",
    "fontSize": "40px",
    "letterSpacing": "0%"
  },
  "text/H1": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "700",
    "fontSize": "32px",
    "letterSpacing": "0%"
  },
  "text/H2": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "700",
    "fontSize": "24px",
    "letterSpacing": "0%"
  },
  "text/H3": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "700",
    "fontSize": "20px",
    "letterSpacing": "0%"
  },
  "text/H4": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "700",
    "fontSize": "16px",
    "letterSpacing": "0%"
  },
  "text/Body XL": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "400",
    "fontSize": "24px",
    "lineHeight": 1.600000023841858,
    "letterSpacing": "0%"
  },
  "text/Body LG Medium": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "500",
    "fontSize": "18px",
    "letterSpacing": "0%"
  },
  "text/Body": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "500",
    "fontSize": "16px",
    "letterSpacing": "3%"
  },
  "text/Body SM": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "400",
    "fontSize": "14px",
    "letterSpacing": "5%"
  },
  "text/Body XS": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "400",
    "fontSize": "12px",
    "letterSpacing": "0%"
  },
  "text/Body XXS Medium": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "500",
    "fontSize": "10px",
    "letterSpacing": "0%"
  },
  "text/Body  XXXS Medium": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "500",
    "fontSize": "8px",
    "letterSpacing": "0%"
  },
  "text/Label LG": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "600",
    "fontSize": "20px",
    "letterSpacing": "0%"
  },
  "text/Label SB": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "600",
    "fontSize": "16px",
    "letterSpacing": "0%"
  },
  "text/Label SM SB": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "600",
    "fontSize": "14px",
    "letterSpacing": "0%"
  },
  "text/Caption SB": {
    "type": "text",
    "fontFamily": "Poppins",
    "fontWeight": "600",
    "fontSize": "12px",
    "letterSpacing": "0%"
  },
  "effect/Elevation 4": {
    "type": "effect",
    "boxShadow": "0px 16px 48px 0px rgba(0, 0, 0, 0.2), 0px 8px 16px 0px rgba(0, 0, 0, 0.12)"
  },
  "effect/Elevation 3": {
    "type": "effect",
    "boxShadow": "0px 6px 16px 0px rgba(0, 0, 0, 0.16), 0px 2px 6px 0px rgba(0, 0, 0, 0.1)"
  },
  "effect/Elevation 2": {
    "type": "effect",
    "boxShadow": "0px 3px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.08)"
  },
  "effect/Elevation 1": {
    "type": "effect",
    "boxShadow": "0px 1px 3px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
  }
} as const;
