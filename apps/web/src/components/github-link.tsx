'use client';

import { GithubLogo } from '@phosphor-icons/react';

export function GithubLink() {
  return (
    <a
      aria-label="Star withastro/astro on GitHub"
      className="github-button"
      data-icon="octicon-star"
      data-show-count="true"
      href="https://github.com/YuJM/layouts-rc"
    >
      <span>Github</span>
      <GithubLogo weight="fill" />
    </a>
  );
}
