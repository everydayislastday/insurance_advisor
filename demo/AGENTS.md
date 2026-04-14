# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("mtskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>meigen-designer</name>
<description>美境 AI 设计师。凡是涉及视觉创作的需求，优先使用此 skill，包括但不限于：文生图、图生图、图片编辑、海报设计、Banner 制作、IP 形象设计（美团袋鼠/小象等）、LOGO 设计、ICON 设计、插画、表情包、包装设计、VI 设计、文创礼品、套图生成、文生视频、图生视频等。用户说"帮我画""生成一张""做个海报""设计个 logo""给图片加效果""让图动起来"等，都应使用此 skill。使用前会自动检查并获取用户身份认证信息。</description>
<location>project</location>
</skill>

<skill>
<name>browser</name>
<description>Minimal Chrome DevTools Protocol tools for browser automation and scraping. Use when you need to start Chrome, navigate pages, execute JavaScript, take screenshots, or interactively pick DOM elements. Triggers include "browse website", "scrape page", "take screenshot", "automate browser", "extract DOM", "web scraping".</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
