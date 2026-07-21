/**
 * An href is "external" only when it resolves to an http(s) origin other than the site's
 * own. Relative paths, hash anchors, and non-navigational schemes (`mailto:`, `tel:`, etc.)
 * are all "internal" -- they don't get `target="_blank"`.
 */
export const isExternalHref = (href: string, siteHostname = "ryan.rowe.codes"): boolean => {
    let url: URL
    try {
        url = new URL(href, `https://${siteHostname}`)
    } catch {
        return false
    }

    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== siteHostname
}
