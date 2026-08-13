"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/comment-api/core";
import { getComments, submitComment } from "@/lib/comment-api/public";
import type { Pagination, PublicComment } from "@/types/comment";
import styles from "@/style/page/comments/CommentsPage.module.css";

const emptyPagination: Pagination = { total: 0, page: 1, limit: 12, pages: 1 };
const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

export function CommentsPage() {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const startedAt = useRef(0);
  const { user, status: authStatus, openSignIn } = useAuth();

  const loadPage = useCallback(async (page: number, clearNotice = true) => {
    setLoading(true);
    setLoadError(null);
    if (clearNotice) setNotice(null);
    try {
      const result = await getComments(page);
      setComments(result.items);
      setPagination(result.pagination);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Comments could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getComments(1)
      .then((result) => {
        if (!active) return;
        setComments(result.items);
        setPagination(result.pagination);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Comments could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    startedAt.current = Date.now();
  }, [user?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      openSignIn();
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      await submitComment({ body, website, startedAt: startedAt.current });
      setBody("");
      setWebsite("");
      startedAt.current = Date.now();
      setNotice({ type: "success", text: "Your message is live. Thanks for writing in." });
      await loadPage(1, false);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : "Your message could not be posted. Please try again.";
      setNotice({ type: "error", text });
      if (error instanceof ApiError && error.status === 401) openSignIn();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.intro}>
        <div className={`container ${styles.introInner}`}>
          <div className={styles.introCopy}>
            <p className={styles.eyebrow}>Community</p>
            <h1>Spin the Wheel Comments - Share Your Ideas and Feedback</h1>
            <p className={styles.lede}>
              Tell us how you use the wheel, suggest a template or feature, or leave
              practical feedback that could make the site more useful for everyone.
            </p>
          </div>
          <aside className={styles.communityCard} aria-label="Ways to contribute">
            <p className={styles.cardEyebrow}>Help shape what comes next</p>
            <h2>What would make the wheel better for you?</h2>
            <ul className={styles.communityList}>
              <li><span>01</span><strong>A template we should add</strong></li>
              <li><span>02</span><strong>A feature that slows you down</strong></li>
              <li><span>03</span><strong>A setup that works in real life</strong></li>
            </ul>
            <a href="#leave-a-comment">Leave a comment <span aria-hidden="true">↓</span></a>
          </aside>
        </div>
      </section>

      <section id="leave-a-comment" className={styles.board}>
        <div className={`container ${styles.layout}`}>
          {authStatus === "loading" ? (
            <div className={`${styles.form} ${styles.authGate}`} aria-live="polite">
              <span className={styles.authGateIcon} aria-hidden="true">●</span>
              <h2>Checking your account</h2>
              <p>Just a moment…</p>
            </div>
          ) : !user ? (
            <aside className={`${styles.form} ${styles.authGate}`}>
              <span className={styles.authGateIcon} aria-hidden="true">G</span>
              <h2>Sign in to comment</h2>
              <p>Reading comments and spinning the wheel stay open to everyone. Sign in with Google only when you want to post.</p>
              <GoogleSignInButton />
              <button type="button" className={styles.signInFallback} onClick={openSignIn}>Why do I need to sign in?</button>
            </aside>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <h2>Write a message</h2>
              <div className={styles.postingAs}>
                <span aria-hidden="true">{user.displayName.charAt(0).toUpperCase()}</span>
                <p>Posting as <strong>{user.displayName}</strong></p>
              </div>
              <label htmlFor="comment-body">Message</label>
              <textarea
                id="comment-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                minLength={3}
                maxLength={1000}
                required
                rows={5}
                placeholder="Keep it short and useful for other visitors."
              />
              <div className={styles.formMeta}>
                <span>Plain text only</span>
                <span>{body.length} / 1000</span>
              </div>
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="comment-website">Website</label>
                <input
                  id="comment-website"
                  name="website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={submitting}>
                {submitting ? "Posting…" : "Post comment"}
              </button>
              <p className={styles.safety}>
                Posts are public under your account name. Automated or repeated spam is blocked.
              </p>
            </form>
          )}

          <div className={styles.feed}>
            <div className={styles.feedHeading}>
              <h2>Latest</h2>
              <span>{pagination.total} {pagination.total === 1 ? "message" : "messages"}</span>
            </div>

            {notice && (
              <div role="status" className={`${styles.notice} ${styles[notice.type]}`}>
                {notice.text}
              </div>
            )}

            {loading ? (
              <div className={styles.state} aria-live="polite">Loading comments…</div>
            ) : loadError ? (
              <div className={`${styles.state} ${styles.errorState}`} role="alert">
                <h3>Comments are unavailable</h3>
                <p>{loadError}</p>
                <button type="button" onClick={() => void loadPage(pagination.page)}>
                  Try again
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className={styles.state}>
                <h3>No messages yet</h3>
                <p>Be the first to leave a note about how you use the wheel.</p>
              </div>
            ) : (
              <ul className={styles.commentList}>
                {comments.map((comment) => (
                  <li key={comment.id} className={styles.comment}>
                    <div className={styles.avatar} aria-hidden="true">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <article>
                      <header>
                        <h3>{comment.username}</h3>
                        <time dateTime={comment.createdAt}>
                          {formatter.format(new Date(comment.createdAt))}
                        </time>
                      </header>
                      <p>{comment.body}</p>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            {!loadError && pagination.pages > 1 && (
              <nav className={styles.pagination} aria-label="Comments pages">
                <button
                  type="button"
                  disabled={pagination.page === 1 || loading}
                  onClick={() => void loadPage(pagination.page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page === pagination.pages || loading}
                  onClick={() => void loadPage(pagination.page + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
