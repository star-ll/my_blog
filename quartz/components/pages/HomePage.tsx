import { FullSlug, resolveRelative } from "../../util/path"
import Darkmode from "../Darkmode"
import Search from "../Search"
import { QuartzComponent, QuartzComponentProps } from "../types"
import style from "../styles/homePage.scss"

const HomeSearch = Search({ enablePreview: true })
const HomeDarkmode = Darkmode()

const writing = [
  {
    category: "AI SYSTEMS",
    date: "AUG 02, 2026",
    title: "长对话角色一致性的工程方法论：从提示词技巧到 Persona Harness 架构",
    description: "从提示词技巧走向可复用、可评估的 Persona Harness 工程体系。",
    slug: "AI System/长对话角色一致性的工程方法论：从提示词技巧到 Persona Harness 架构",
  },
  {
    category: "AI ENGINEERING",
    date: "SEP 2026",
    title: "当代码变得廉价：架构优先的 AI Code 思考与实践",
    description: "当生成代码的成本下降，架构、约束与反馈系统如何成为新的核心能力。",
    slug: "AI Code/当代码变得廉价：架构优先的 AI Code 思考与实践",
  },
  {
    category: "WEB INTERNALS",
    date: "JUN 2026",
    title: "Chromium 分层合成 vs Firefox WebRender 的 GPU 革命",
    description: "从渲染流水线理解两种浏览器架构对图形合成问题的不同回答。",
    slug: "浏览器篇/深入浏览器引擎 III：Chromium分层合成 vs Firefox WebRender的GPU革命",
  },
]

const HomePage: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData } = props
  const link = (slug: string) => resolveRelative(fileData.slug!, slug as FullSlug)

  return (
    <article class="home-page">
      <header class="home-nav" aria-label="Primary navigation">
        <a class="home-brand" href={link("index")} aria-label="YU / LAB home">
          YU / LAB
        </a>
        <span class="home-mantra">Build · Learn · Share</span>
        <nav>
          <a href={link("writing")}>Writing</a>
          <a href={link("lab")}>Lab</a>
          <a href="#about">About</a>
          <a href="https://github.com/star-ll" class="external">
            GitHub
          </a>
          <HomeSearch {...props} />
          <span class="home-nav-divider" aria-hidden="true" />
          <HomeDarkmode {...props} />
        </nav>
      </header>

      <main>
        <section class="home-hero" id="about">
          <div class="home-hero-copy">
            <p class="home-kicker">ENGINEER / BUILDER / WRITER</p>
            <h1>Yu Jin</h1>
            <h2>Building reliable AI systems and understanding software from the inside out.</h2>
            <p class="home-lead">I learn by building things.</p>
            <p class="home-topics">
              AI SYSTEMS · AGENT ENGINEERING · WEB INTERNALS · FRAMEWORK DESIGN
            </p>
          </div>
          <aside class="home-hero-aside">
            <p>Notes, experiments, and technical deep dives on building better software with AI.</p>
            <span class="home-accent-rule" aria-hidden="true" />
            <blockquote>Build to learn. Write to think clearly.</blockquote>
            <span>— Yu Jin</span>
          </aside>
        </section>

        <section class="home-feature" aria-labelledby="featured-lab-title">
          <div class="home-section-label" id="featured-lab-title">
            FEATURED LAB <span aria-hidden="true" />
          </div>
          <div class="home-feature-grid">
            <div class="home-feature-copy">
              <div class="home-project-title">
                <h2>Deco</h2>
                <p>/ DECO FRAMEWORK</p>
              </div>
              <p class="home-project-description">
                A Web Component framework built from first principles to understand reactivity,
                rendering, scheduling, and framework trade-offs.
              </p>
              <ul class="home-tech-list" aria-label="Deco capabilities">
                {[
                  "Reactive System",
                  "JSX Renderer",
                  "Scheduler",
                  "Lifecycle",
                  "Decorators",
                  "Plugins",
                  "Playwright",
                ].map((item) => (
                  <li>{item}</li>
                ))}
              </ul>
              <div class="home-actions">
                <a class="home-button home-button-primary" href={link("lab/deco")}>
                  Explore the case study
                </a>
                <a class="home-button" href="https://github.com/star-ll/Deco">
                  View source
                </a>
              </div>
              <p class="home-project-meta">
                <span>TypeScript</span>
                <span>Educational</span>
                <span>19 stars</span>
                <span>2024–2025</span>
              </p>
            </div>
            <div class="home-code-panel" aria-label="Deco repository structure">
              <div class="home-code-heading">
                <span>deco/</span>
                <span>
                  A SMALL FRAMEWORK
                  <br />A DEEPER UNDERSTANDING
                </span>
              </div>
              <pre>{`packages/
  core/          # reactivity & runtime
  renderer/      # JSX → DOM
  scheduler/     # task scheduling
  components/    # web components
  devtools/      # debugging tools

examples/
tests/
docs/
...`}</pre>
              <p>Build to understand.</p>
            </div>
          </div>
        </section>

        <section class="home-writing-now">
          <div class="home-writing">
            <div class="home-section-heading">
              <div class="home-section-label">
                SELECTED WRITING <span aria-hidden="true" />
              </div>
              <a href={link("writing")}>View all posts</a>
            </div>
            <div class="home-writing-list">
              {writing.map((post) => (
                <a class="home-writing-item internal" href={link(post.slug)}>
                  <div class="home-writing-meta">
                    <strong>{post.category}</strong>
                    <span>{post.date}</span>
                  </div>
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <aside class="home-now">
            <div class="home-section-label">
              NOW <span aria-hidden="true" />
            </div>
            <div class="home-now-item">
              <h3>Building lightweight agent systems in Rust</h3>
              <p>
                Exploring simple, reliable agent systems with stronger abstractions and real
                experiments.
              </p>
              <div>
                <span class="home-status home-status-active" />
                In progress <time>SEP 19, 2026</time>
              </div>
            </div>
            <div class="home-now-item">
              <h3>Exploring agent architecture / context engineering</h3>
              <p>
                Notes on tools, memory, orchestration, and reliable context for real-world
                applications.
              </p>
              <div>
                <span class="home-status" />
                Research <time>SEP 19, 2026</time>
              </div>
            </div>
          </aside>
        </section>

        <section class="home-philosophy">
          <div>
            <div class="home-section-label">
              PHILOSOPHY <span aria-hidden="true" />
            </div>
            <blockquote>“I build to learn, and I write to think clearly.”</blockquote>
          </div>
          <p>
            Curiosity drives better engineers. A deeper understanding of how things work leads to
            more reliable and useful software.
            <br />
            <span>— Yu Jin</span>
          </p>
        </section>
      </main>
    </article>
  )
}

HomePage.css = style

export default HomePage
