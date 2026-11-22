import { MemoryRouter } from "react-router-dom";
import "../src/index.css";
import Cursor from "../src/components/Cursor/Cursor";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },

  // Components use <Link>/<NavLink>/useNavigate, so every story needs a
  // router. A story can pick the current URL with
  // parameters: { router: { initialEntries: ["/works"] } }.
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={parameters.router?.initialEntries ?? ["/"]}>
        {/* Same custom cursor as the site (element in preview-body.html) */}
        <Cursor />
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default preview;
