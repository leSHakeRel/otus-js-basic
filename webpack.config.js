import path from "node:path";
import { fileURLToPath } from "node:url";
import HtmlWebpackPlugin from "html-webpack-plugin";

// In Node.js versions prior to native support for import.meta.dirname,
// derive __dirname from import.meta.url.
// (Node 20.11+ supports import.meta.dirname and import.meta.filename.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: "ESNext",
                moduleResolution: "bundler",
                allowJs: true,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },    
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 9000,
    hot: true,
  },
  plugins: [new HtmlWebpackPlugin()],
};
