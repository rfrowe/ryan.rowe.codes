import { useCallback, useMemo, useState } from "react";
import ConsoleTypist from "./ConsoleTypist";
import * as styles from "./HeadlineCycler.css.ts";

/** One home-page headline: the text to type, and the dated post URL it links to. */
export interface HeadlinePost {
  headline: string;
  href: string;
}

export interface HeadlineCyclerProps {
  posts: HeadlinePost[];
}

const defaultPost: HeadlinePost = {
  headline: "Absolutely Nothing.",
  href: "",
};

/**
 * Home page island: cycles through `posts`' headlines via ConsoleTypist, each one linking
 * to its post's dated URL. `index` only ever increments -- ConsoleTypist itself drives the
 * type/erase/type sequence off the resulting `text` prop change, so this component just
 * tracks "which post is current" and advances it once a headline finishes typing.
 */
const HeadlineCycler = ({ posts }: HeadlineCyclerProps) => {
  const [index, setIndex] = useState(0);
  const advanceHeadline = useCallback(() => setIndex(i => i + 1), []);

  const post = useMemo(() => (posts.length > 0 ? posts[index % posts.length] : defaultPost), [posts, index]);

  return (
    <a href={post.href} className={styles.link}>
      <ConsoleTypist className={styles.typedText} text={post.headline} onTypingFinished={advanceHeadline} />
    </a>
  );
};

export default HeadlineCycler;
