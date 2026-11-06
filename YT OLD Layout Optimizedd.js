// ==UserScript==
// @name         YouTube Layout Fix - Optimized for Multi-Column Grid + No Shorts
// @namespace    http://tampermonkey.net/
// @version      5.33
// @description  Forces a 6-column grid, hides ads/Shorts/unwanted shelves, fixes channel/search/watch layout bugs, and adjusts text spacing.
// @author       Hardeep Shetty
// @match        https://www.youtube.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/Dashetty/YouTube-Layout-Fix--Optimized-for-Multi-Column-Grid-No-Shorts/refs/heads/main/YT%20OLD%20Layout%20Optimizedd.js
// @updateURL    https://raw.githubusercontent.com/Dashetty/YouTube-Layout-Fix--Optimized-for-Multi-Column-Grid-No-Shorts/refs/heads/main/YT%20OLD%20Layout%20Optimizedd.js
// ==/UserScript==

(function () {
  "use strict";

  // --- ADJUSTABLE VALUES (User Prefs) ---

  // === OPTIONAL ADJUSTMENTS ===
  const showFullTitles = 0; // 1 = Show entire title of the video, 0 = YouTube default title size.
  const showFullChannelNames = 0; // 1 = Show entire username of the channel, 0 = YouTube default channel size.
  const disableWatchHoverEffects = 1; // 1 = Disable hovers on buttons/description, 0 = Default YouTube hover effects.
  const hideUnwantedContent = 1; // 1 = Hides Shorts & unwanted shelves, 0 = Default YouTube behaviour.

  // === General Grid Layout ===
  const desiredColumnCount = 6;
  const gridEdgePadding = "24px";
  const gridItemHorizontalMargin = "6px";
  const gridItemBottomMargin = "24px";

  // === Grid Items - Text & Spacing ===
  const gridTitleScale = 1.08;
  const gridChannelScale = 1.15;
  const gridMetadataScale = 1.2;
  const gridChannelMarginTop = "-1px";
  const gridMetaMarginTop = "-4px";
  const gridBylineMarginBottom = "5px";

  // === Channel Page Specifics ===
  const channelShelfItemWidth = 230;

  // === Search Results Page - Layout ===
  const searchThumbnailWidth = "350px";
  const searchResultsSectionMarginBottom = "0px";

  // === Search Results Page - Text Sizes ===
  const searchTitleScale = 1.4;
  const searchChannelScale = 1.2;
  const searchVideoViewsDateScale = 1.6;
  const searchMetaSnippetScale = 1.35;
  const searchChannelSubMetaScale = 1.6;
  const searchPlaylistMetaSizeOffset = 2;

  // === Search Results Page - Channel Item Layout ===
  const searchChannelAvatarMaxWidth = "362px";
  const searchChannelTextMaxWidth = "630px";

  // === Watch Page - Below Video Player ===
  const watchOwnerChannelScale = 1.5;
  const watchTopRowMarginTop = "5px";
  const watchBottomRowMarginTop = "10px";
  const watchSubCountMarginTop = "-3.5px";

  // === Sidebar ===
  const sidebarTitleScale = 1.05;
  const sidebarChannelNameScale = 1.3;
  const sidebarViewsDateScale = 1.2;
  const sidebarTitleMarginBottom = "6px";
  const sidebarBadgeScale = 0.85;
  const sidebarBadgeMarginTop = "2px";
  const sidebarBadgeMarginBottom = "0px";
  const sidebarThumbnailPercent = 35;

  // === Comment Section ===
  const commentTextScale = 1.25;
  const commentMetaScale = 1.1;

  // --- Technical Values ---
  const minimalPxReduction = "0.01px";
  const channelShelfItemHeight = Math.round((channelShelfItemWidth / 16) * 9);

  // --- END OF ADJUSTABLE VALUES ---

  let css = `
        :root {
           --gm-grid-title-size: ${gridTitleScale}em;
           --gm-grid-channel-size: ${gridChannelScale}em;
           --gm-grid-metadata-size: ${gridMetadataScale}em;
           --gm-grid-metadata-final-size: calc(1.3rem * ${gridMetadataScale});
           --gm-watch-owner-channel-size: ${watchOwnerChannelScale}em;
           --gm-watch-title-size: 1.5rem;
           --gm-sidebar-title-size: ${sidebarTitleScale}em;
           --gm-sidebar-channel-size: ${sidebarChannelNameScale}em;
           --gm-sidebar-viewsdate-size: ${sidebarViewsDateScale}em;
           --gm-sidebar-badge-size: ${sidebarBadgeScale}em;
           --gm-search-title-scale: ${searchTitleScale};
           --gm-search-channel-scale: ${searchChannelScale};
           --gm-search-title-size: calc(1.0rem * var(--gm-search-title-scale));
           --gm-search-channel-size: calc(0.8em * var(--gm-search-channel-scale));
           --gm-search-metasnippet-size: calc(0.8em * ${searchMetaSnippetScale});
           --gm-search-video-views-date-size: calc(0.78rem * ${searchVideoViewsDateScale});
           --gm-search-channel-submeta-size: calc(0.8rem * ${searchChannelSubMetaScale});
           --gm-comment-text-final-size: calc(1rem * ${commentTextScale});
           --gm-comment-meta-final-size: calc(0.8rem * ${commentMetaScale});
           --gm-search-playlist-meta-final-size: calc(var(--gm-search-video-views-date-size) + ${searchPlaylistMetaSizeOffset}px);
        }

        /* === GLOBAL FIXES & STYLES === */

        /* Hide Verified & Artist Badges */
        ytd-badge-supported-renderer:has(.badge.badge-style-type-verified),
        ytd-badge-supported-renderer:has(.badge.badge-style-type-verified-artist),
        ytd-author-comment-badge-renderer yt-icon,
        .yt-core-attributed-string__image-element:not(img),
        .ytAttributedStringImageElement,
        .ytAttributedStringInlineBlockMod,
        .ytContentMetadataViewModelIcon {
            display: none !important;
        }

        /* UI Annoyance Fixes */
        ytd-app {
            overflow-x: hidden !important;
        }
        html.fullscreen,
        html.fullscreen body {
            overflow-x: hidden !important;
        }
        .ytp-fullscreen-button::after,
        #contentContainer::after,
        .ytp-play-button::before {
            content: none !important;
        }
        /* Home header height (gm-home class toggled by JS on navigation) */
        html.gm-home #frosted-glass.with-chipbar {
            height: 56px !important;
        }

        /* === MAIN GRID LAYOUT & STYLING === */

        /* Hide Unwanted Grid Items & Shelves */
        #masthead-ad,
        ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
        ytd-rich-section-renderer {
            display: none !important;
        }

        /* Grid Container */
        #contents.ytd-rich-grid-renderer {
            padding-left: ${gridEdgePadding} !important;
            padding-right: ${gridEdgePadding} !important;
            box-sizing: border-box !important;
            width: 100% !important;
        }
        ytd-browse[page-subtype="channels"] #contents.ytd-rich-grid-renderer,
        ytd-browse[page-subtype="channels"] ytd-item-section-renderer #contents > ytd-rich-grid-renderer {
            padding-left: ${gridEdgePadding} !important;
            padding-right: ${gridEdgePadding} !important;
            box-sizing: border-box !important;
            width: 100% !important;
        }

        /* Force single row to wrap vertically (History / metadata row) */
        .ytContentMetadataViewModelMetadataRowMetadataRowPadding {
            display: flex !important;
            flex-wrap: wrap !important;
            height: auto !important;
            line-height: normal !important;
        }
        .ytContentMetadataViewModelMetadataRowMetadataRowPadding .ytContentMetadataViewModelMetadataText:first-of-type,
        .ytContentMetadataViewModelMetadataRowMetadataRowPadding .ytContentMetadataViewModelMetadataText:first-of-type a {
            display: block !important;
            width: 100% !important;
            font-size: var(--gm-grid-channel-size) !important;
            margin-bottom: 2px !important;
        }
        .ytContentMetadataViewModelMetadataRowMetadataRowPadding .ytContentMetadataViewModelMetadataText:not(:first-of-type),
        .ytContentMetadataViewModelMetadataRowMetadataRowPadding .ytContentMetadataViewModelDelimiter,
        .ytContentMetadataViewModelMetadataRowMetadataRowPadding .ytContentMetadataViewModelLeadingIcon {
            font-size: var(--gm-grid-metadata-size) !important;
        }

        /* Force row wrap on Home grid lockup items (non-playlist) */
        ytd-rich-item-renderer yt-lockup-view-model:not(:has(.ytLockupViewModelCollectionStack2)):not(:has(a[href*="/playlist"])) .ytContentMetadataViewModelMetadataRow {
            display: flex !important;
            flex-wrap: wrap !important;
            height: auto !important;
            line-height: normal !important;
        }
        ytd-rich-item-renderer yt-lockup-view-model:not(:has(.ytLockupViewModelCollectionStack2)):not(:has(a[href*="/playlist"])) .ytContentMetadataViewModelMetadataRow .ytContentMetadataViewModelMetadataText:first-of-type,
        ytd-rich-item-renderer yt-lockup-view-model:not(:has(.ytLockupViewModelCollectionStack2)):not(:has(a[href*="/playlist"])) .ytContentMetadataViewModelMetadataRow .ytContentMetadataViewModelMetadataText:first-of-type a {
            display: block !important;
            width: 100% !important;
            font-size: var(--gm-grid-channel-size) !important;
            margin-bottom: 2px !important;
        }
        ytd-rich-item-renderer yt-lockup-view-model:not(:has(.ytLockupViewModelCollectionStack2)):not(:has(a[href*="/playlist"])) .ytContentMetadataViewModelMetadataRow .ytContentMetadataViewModelMetadataText:not(:first-of-type),
        ytd-rich-item-renderer yt-lockup-view-model:not(:has(.ytLockupViewModelCollectionStack2)):not(:has(a[href*="/playlist"])) .ytContentMetadataViewModelMetadataRow .ytContentMetadataViewModelDelimiter {
            font-size: var(--gm-grid-metadata-size) !important;
        }

        /* Unified Grid Item Layout (ALL feeds) */
        #contents.ytd-rich-grid-renderer > ytd-rich-item-renderer {
            margin-left: ${gridItemHorizontalMargin} !important;
            margin-right: ${gridItemHorizontalMargin} !important;
            margin-bottom: ${gridItemBottomMargin} !important;
            max-width: calc(100% / ${desiredColumnCount} - ${gridItemHorizontalMargin} * 2 - ${minimalPxReduction}) !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            #contents.ytd-rich-grid-renderer > ytd-rich-item-renderer {
            border: none !important;
        }

        /* Title styling (all rich items) */
        ytd-rich-item-renderer .yt-lockup-metadata-view-model-wiz__title,
        ytd-rich-item-renderer .ytLockupMetadataViewModelTitle,
        ytd-rich-item-renderer .ytLockupMetadataViewModelTitle span {
            font-size: var(--gm-grid-title-size) !important;
            line-height: 1.2em !important;
            max-height: 2.4em !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            margin-bottom: 1px !important;
        }

        /* Metadata text styling (all rich items) */
        ytd-rich-item-renderer .yt-content-metadata-view-model-wiz__metadata-text,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataText,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataText a,
        ytd-rich-item-renderer .ytAttributedStringHost,
        ytd-rich-item-renderer .ytAttributedStringLink {
            font-size: var(--gm-grid-metadata-size) !important;
            line-height: 1.3em !important;
            display: inline !important;
        }
        ytd-rich-item-renderer .yt-lockup-metadata-view-model-wiz__metadata {
            margin-top: ${gridMetaMarginTop} !important;
            line-height: 1.3em;
        }
        ytd-rich-item-renderer a.yt-core-attributed-string__link--call-to-action-color {
            font-size: 0.9em !important;
            margin-top: 2px !important;
        }

        /* Rule Set 1A: Legacy renderer (home / subs / channels) */
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer #video-title.ytd-rich-grid-media {
            font-size: var(--gm-grid-title-size) !important;
            line-height: 1.2em !important;
            max-height: 2.4em !important;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 1px !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer #byline-container {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: flex !important;
            align-items: center !important;
            margin-top: ${gridChannelMarginTop} !important;
            line-height: 1.2em !important;
            gap: 0 !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer ytd-channel-name {
            font-size: var(--gm-grid-channel-size) !important;
            line-height: 1.25em !important;
            display: inline-block !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            flex-grow: 1 !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            vertical-align: baseline !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer #metadata-line {
            line-height: 1.3em !important;
            margin-top: ${gridMetaMarginTop} !important;
            display: block !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer #metadata-line > span {
            font-size: var(--gm-grid-metadata-final-size) !important;
            line-height: 1.2em !important;
            display: inline !important;
            vertical-align: baseline !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer #metadata-line > span:first-of-type {
            margin-right: 0.5em !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"],
            ytd-browse[page-subtype="channels"])
            ytd-rich-item-renderer #metadata-line > span:first-of-type::after {
            content: none !important;
        }

        /* Rule Set 1B: Modern renderer (home / subs) */
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"])
            ytd-rich-item-renderer .yt-lockup-metadata-view-model__title,
        ytd-rich-item-renderer .ytLockupMetadataViewModelTitle,
        ytd-rich-item-renderer .ytLockupMetadataViewModelTitle .ytAttributedStringHost {
            font-size: var(--gm-grid-title-size) !important;
            line-height: 1.2em !important;
            max-height: 2.4em !important;
            -webkit-line-clamp: 2 !important;
            margin-bottom: 1px !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"])
            ytd-rich-item-renderer .yt-lockup-metadata-view-model__metadata {
            margin-top: ${gridChannelMarginTop} !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"])
            ytd-rich-item-renderer .yt-content-metadata-view-model__metadata-row:first-of-type .yt-core-attributed-string > span,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataRow:first-of-type .yt-core-attributed-string,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataRow:first-of-type .ytAttributedStringHost,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataRow:first-of-type .ytAttributedStringLink {
            font-size: var(--gm-grid-channel-size) !important;
            line-height: 1.25em !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"])
            ytd-rich-item-renderer .yt-content-metadata-view-model__metadata-row:last-of-type .yt-core-attributed-string,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataRow:not(:only-child):last-of-type .yt-core-attributed-string,
        ytd-rich-item-renderer .ytContentMetadataViewModelMetadataRow:not(:only-child):last-of-type .ytAttributedStringHost,
        ytd-rich-item-renderer .ytContentMetadataViewModelDelimiter {
            font-size: var(--gm-grid-metadata-final-size) !important;
            line-height: 1.2em !important;
            display: inline !important;
            vertical-align: baseline !important;
        }
        :is(ytd-browse[page-subtype="home"],
            ytd-browse[page-subtype="subscriptions"])
            ytd-rich-item-renderer .yt-content-metadata-view-model__metadata-row {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
        }

        /* === CHANNEL PAGE SPECIFIC STYLES === */

        ytd-browse[page-subtype="channels"] ytd-rich-grid-renderer > #contents > ytd-grid-video-renderer {
            max-width: calc(100% / ${desiredColumnCount} - ${gridItemHorizontalMargin} * 2 - ${minimalPxReduction}) !important;
        }
        ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #video-title {
            font-size: var(--gm-grid-title-size) !important;
            line-height: 1.2em !important;
            max-height: 2.4em !important;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 1px !important;
        }
        ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #metadata-line {
            line-height: 1.3em !important;
            margin-top: ${gridMetaMarginTop} !important;
            display: block !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        ytd-browse[page-subtype="channels"] ytd-shelf-renderer .ytContentMetadataViewModelMetadataText,
        ytd-browse[page-subtype="channels"] ytd-shelf-renderer .ytContentMetadataViewModelDelimiter {
            font-size: var(--gm-grid-metadata-size) !important;
        }
        ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #metadata-line > span {
            font-size: var(--gm-grid-metadata-size) !important;
            line-height: 1.2em !important;
            display: inline !important;
            vertical-align: baseline !important;
        }
        ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #byline-container {
            margin-bottom: ${gridBylineMarginBottom} !important;
        }
        ytd-shelf-renderer:not(:has(ytd-thumbnail[size="large"])) yt-horizontal-list-renderer ytd-grid-video-renderer {
            margin: 0 ${gridItemHorizontalMargin} !important;
        }
        ytd-shelf-renderer ytd-grid-video-renderer:has(ytd-thumbnail[size="large"]),
        yt-horizontal-list-renderer[grid-video-width="354"] yt-lockup-view-model {
            width: ${channelShelfItemWidth}px !important;
            margin: 0 ${gridItemHorizontalMargin} !important;
        }
        ytd-shelf-renderer ytd-grid-video-renderer:has(ytd-thumbnail[size="large"]) ytd-thumbnail,
        yt-horizontal-list-renderer[grid-video-width="354"] .ytLockupViewModelContentImage {
            width: 100% !important;
            height: ${channelShelfItemHeight}px !important;
        }

        /* === SEARCH RESULTS PAGE (/results) === */

        ytd-search-header-renderer[has-chip-bar] {
            margin-bottom: 16px !important;
        }
        ytd-search ytd-item-section-renderer {
            margin-bottom: ${searchResultsSectionMarginBottom} !important;
            margin-top: 0 !important;
        }

        /* Video Items */
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] {
            display: flex !important;
            margin-bottom: 0 !important;
            align-items: flex-start !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] #dismissible ytd-thumbnail.ytd-video-renderer {
            width: ${searchThumbnailWidth} !important;
            min-width: ${searchThumbnailWidth} !important;
            max-width: ${searchThumbnailWidth} !important;
            flex-basis: ${searchThumbnailWidth} !important;
            flex-shrink: 0 !important;
        }
        ytd-search ytd-video-renderer[is-search] #dismissible {
            display: flex !important;
            width: 100% !important;
        }
        ytd-search ytd-video-renderer[is-search] #dismissible .text-wrapper {
            margin-left: 12px !important;
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] a#video-title.ytd-video-renderer,
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] a#video-title.ytd-video-renderer yt-formatted-string {
            font-size: var(--gm-search-title-size) !important;
            line-height: 1.25em !important;
            max-height: 2.5em !important;
            -webkit-line-clamp: 2 !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin-bottom: 3px !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] #metadata-line.ytd-video-meta-block span.inline-metadata-item {
            font-size: var(--gm-search-video-views-date-size) !important;
            line-height: 1.3em !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] #channel-name.ytd-video-renderer yt-formatted-string > a,
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] #channel-name.ytd-video-renderer yt-formatted-string {
            font-size: var(--gm-search-channel-size) !important;
            line-height: 1.3em !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] #channel-thumbnail.ytd-video-renderer {
            width: 20px !important;
            height: 20px !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] .metadata-snippet-container.ytd-video-renderer yt-formatted-string.metadata-snippet-text,
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] .metadata-snippet-container-one-line.ytd-video-renderer yt-formatted-string.metadata-snippet-text {
            font-size: 1.2rem !important;
            line-height: 1.3em !important;
            max-height: 2.6em !important;
            overflow: hidden !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] .metadata-snippet-container.ytd-video-renderer,
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] .metadata-snippet-container-one-line.ytd-video-renderer {
            width: 100% !important;
            max-width: none !important;
            display: block !important;
            margin-top: 4px !important;
        }
        ytd-search ytd-item-section-renderer ytd-video-renderer[is-search] #expandable-metadata.ytd-video-renderer {
            display: none !important;
        }

        /* Playlist Items (in Search) */
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-view-model--horizontal,
        ytd-search ytd-item-section-renderer yt-lockup-view-model .ytLockupViewModelHorizontal {
            display: flex !important;
            align-items: flex-start !important;
            margin-bottom: 0 !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model a.yt-lockup-view-model__content-image,
        ytd-search ytd-item-section-renderer yt-lockup-view-model a.ytLockupViewModelContentImage {
            width: ${searchThumbnailWidth} !important;
            min-width: ${searchThumbnailWidth} !important;
            max-width: ${searchThumbnailWidth} !important;
            flex-basis: ${searchThumbnailWidth} !important;
            flex-shrink: 0 !important;
            margin-right: 12px !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-view-model__metadata,
        ytd-search ytd-item-section-renderer yt-lockup-view-model .ytLockupViewModelMetadata {
            position: relative !important;
            flex: 1 !important;
            width: auto !important;
            max-width: none !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model,
        ytd-search ytd-item-section-renderer .ytLockupMetadataViewModel {
            width: 100%;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model__text-container,
        ytd-search ytd-item-section-renderer .ytLockupMetadataViewModelTextContainer {
            width: 100% !important;
            padding-right: 44px !important;
            box-sizing: border-box !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model__menu-button,
        ytd-search ytd-item-section-renderer .ytLockupMetadataViewModelMenuButton {
            position: absolute !important;
            top: -11px !important;
            right: 0px !important;
            width: 40px !important;
            height: 40px !important;
            z-index: 5 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model__menu-button button-view-model > button.yt-spec-button-shape-next {
            width: 40px !important;
            height: 40px !important;
            padding: 8px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model__menu-button button-view-model > button.yt-spec-button-shape-next .yt-spec-button-shape-next__icon {
            margin: 0 !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model__title,
        ytd-search ytd-item-section-renderer .ytLockupMetadataViewModelTitle {
            font-size: var(--gm-search-title-size) !important;
            line-height: 1.25em !important;
            max-height: 2.5em !important;
            -webkit-line-clamp: 2 !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin-bottom: 4px !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-content-metadata-view-model > .yt-content-metadata-view-model__metadata-row:not(:first-of-type) .yt-content-metadata-view-model__metadata-text {
            font-size: var(--gm-search-metasnippet-size) !important;
            line-height: 1.3em !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-content-metadata-view-model > .yt-content-metadata-view-model__metadata-row:first-of-type .yt-content-metadata-view-model__metadata-text,
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-content-metadata-view-model > .yt-content-metadata-view-model__metadata-row:last-of-type .yt-content-metadata-view-model__metadata-text,
        ytd-search ytd-item-section-renderer .ytContentMetadataViewModelMetadataText {
            font-size: var(--gm-search-playlist-meta-final-size) !important;
            line-height: 1.3em !important;
        }
        ytd-search ytd-item-section-renderer yt-lockup-view-model .yt-content-metadata-view-model__metadata-row {
            margin-bottom: 2px;
        }

        /* Channel Items (in Search) */
        ytd-search ytd-item-section-renderer ytd-channel-renderer {
            display: block;
            margin-bottom: 0 !important;
            width: 100%;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #content-section {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #avatar-section {
            max-width: ${searchChannelAvatarMaxWidth} !important;
            min-width: 240px !important;
            margin-right: 16px !important;
            flex-shrink: 0 !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer[use-bigger-thumbs][bigger-thumb-style=BIG] #avatar-section,
        ytd-search ytd-item-section-renderer ytd-channel-renderer[use-bigger-thumbs] #avatar-section {
            max-width: ${searchChannelAvatarMaxWidth} !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #info-section {
            flex-grow: 1 !important;
            min-width: 0;
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #info-section a#main-link {
            max-width: ${searchChannelTextMaxWidth} !important;
            flex-grow: 1;
            min-width: 0;
            display: block;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #buttons {
            display: flex !important;
            align-items: center !important;
            flex-shrink: 0 !important;
            margin-left: 16px !important;
            padding-right: 72px !important;
            box-sizing: border-box !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #channel-title yt-formatted-string {
            font-size: var(--gm-search-title-size) !important;
            line-height: 1.3em !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #metadata yt-formatted-string,
        ytd-search ytd-item-section-renderer ytd-channel-renderer #metadata span {
            font-size: var(--gm-search-channel-submeta-size) !important;
            line-height: 1.4em !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #metadata {
            margin-top: 2px !important;
        }
        ytd-search ytd-item-section-renderer ytd-channel-renderer #description {
            font-size: 1.2rem !important;
            line-height: 1.3em !important;
            -webkit-line-clamp: 2 !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin-top: 4px !important;
        }

        /* === WATCH PAGE (/watch) === */

        .title.ytd-video-primary-info-renderer h1.ytd-video-primary-info-renderer {
            font-size: var(--gm-watch-title-size) !important;
            line-height: 1.2em !important;
        }
        #top-row.ytd-watch-metadata {
            margin-top: ${watchTopRowMarginTop} !important;
        }
        #bottom-row.ytd-watch-metadata {
            margin-top: ${watchBottomRowMarginTop} !important;
        }
        ytd-video-owner-renderer ytd-channel-name {
            font-size: var(--gm-watch-owner-channel-size) !important;
            line-height: 1.05em !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
        }
        #owner-sub-count.ytd-video-owner-renderer {
            margin-top: ${watchSubCountMarginTop} !important;
            margin-bottom: 0 !important;
        }
        #description-inner #description .content.ytd-video-secondary-info-renderer,
        .ytd-expander.ytd-video-secondary-info-renderer {
            font-size: 0.8em !important;
            line-height: 1.35em !important;
        }
        #info-text.ytd-video-primary-info-renderer {
            font-size: 0.8em !important;
        }
    `;

  if (disableWatchHoverEffects === 1) {
    css += `
            /* Subscribe Button (with fallback so obfuscated var misses don't break it) */
            .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--filled:hover {
                background: var(--tffc2fd3a644f6275, transparent) !important;
                border-color: transparent !important;
            }

            /* Like, share and other tonal buttons */
            .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--tonal:hover {
                background: var(--t7f4f2c6d54836ce0, transparent) !important;
                border-color: transparent !important;
            }

            /* Description Box (dark-mode only) */
            ytd-watch-metadata[description-collapsed] #description.ytd-watch-metadata:hover {
                background-color: #272727 !important;
                background: #272727 !important;
            }

            /* Global cleanup of feedback layers */
            yt-touch-feedback-shape, yt-interaction {
                display: none !important;
            }
        `;
  }

  css += `
        /* === SIDEBAR (Watch Page) === */

        #related a.ytLockupViewModelContentImage {
            width: ${sidebarThumbnailPercent}% !important;
            max-width: ${sidebarThumbnailPercent}% !important;
            flex-basis: ${sidebarThumbnailPercent}% !important;
            flex-shrink: 0 !important;
        }
        #related .ytContentMetadataViewModelMetadataRow:first-of-type .ytContentMetadataViewModelMetadataText {
            font-size: var(--gm-sidebar-channel-size) !important;
        }
        #related .ytContentMetadataViewModelMetadataRow:nth-child(2) .ytContentMetadataViewModelMetadataText,
        #related .ytContentMetadataViewModelDelimiter,
        #related .ytContentMetadataViewModelLeadingIcon {
            font-size: var(--gm-sidebar-viewsdate-size) !important;
        }
        ytd-compact-video-renderer h3.ytd-compact-video-renderer {
            margin-bottom: ${sidebarTitleMarginBottom} !important;
            margin-top: 0 !important;
        }
        #video-title.ytd-compact-video-renderer {
            font-size: var(--gm-sidebar-title-size) !important;
            line-height: 1.3em !important;
            max-height: 2.6em !important;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        ytd-compact-video-renderer ytd-channel-name {
            font-size: var(--gm-sidebar-channel-size) !important;
            line-height: 1.35em !important;
            margin-bottom: 1px !important;
        }
        ytd-compact-video-renderer #metadata-line span.inline-metadata-item {
            font-size: var(--gm-sidebar-viewsdate-size) !important;
            line-height: 1.45em !important;
        }
        ytd-compact-video-renderer ytd-badge-supported-renderer.badges {
            margin-top: ${sidebarBadgeMarginTop} !important;
            margin-bottom: ${sidebarBadgeMarginBottom} !important;
            font-size: var(--gm-sidebar-badge-size) !important;
            line-height: 1.2 !important;
        }

        /* === COMMENT SECTION === */

        ytd-comment-replies-renderer ytd-comment-view-model[is-reply] > #main > #expander {
            font-size: 1rem !important;
        }
        ytd-comment-view-model #expander > #content > yt-attributed-string#content-text {
            font-size: var(--gm-comment-text-final-size) !important;
            line-height: 1.5em !important;
        }
        ytd-comments ytd-comment-thread-renderer > ytd-comment-view-model:not([is-reply]) #header-author #author-text,
        ytd-comments ytd-comment-thread-renderer > ytd-comment-view-model:not([is-reply]) #header-author .published-time-text.ytd-comment-view-model a {
            font-size: var(--gm-comment-meta-final-size) !important;
            line-height: 1.4em !important;
        }
        ytd-comments ytd-comment-replies-renderer ytd-comment-view-model[is-reply] #header-author #author-text,
        ytd-comments ytd-comment-replies-renderer ytd-comment-view-model[is-reply] #header-author .published-time-text.ytd-comment-view-model a {
            font-size: calc(var(--gm-comment-meta-final-size) + 3px) !important;
            line-height: 1.4em !important;
        }
        #toolbar.ytd-comment-action-buttons-renderer {
            font-size: var(--gm-comment-meta-final-size) !important;
        }
        #header-author #author-text.ytd-comment-renderer {
            color: #aaa !important;
        }
    `;

  // === HIDE UNWANTED SHELVES & SHORTS ===
  if (hideUnwantedContent === 1) {
    css += `
            ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
            ytd-search ytd-shelf-renderer,
            ytd-search ytd-horizontal-list-renderer,
            ytd-search ytd-reel-shelf-renderer,
            ytd-search grid-shelf-view-model,
            ytd-search ytd-horizontal-card-list-renderer,
            ytd-search ytd-video-renderer[is-search]:has(a#thumbnail[href^="/shorts/"]),
            ytd-guide-entry-renderer:has(a#endpoint[title="Shorts"]),
            yt-chip-cloud-chip-renderer:has(yt-formatted-string#text[title="Shorts"]),
            yt-horizontal-list-renderer ytm-shorts-lockup-view-model-v2,
            yt-tab-shape[tab-title="Shorts"] {
                display: none !important;
            }
        `;
  }

  // === SHOW FULL TITLES ===
  if (showFullTitles === 1) {
    css += `
            :is(ytd-browse[page-subtype="home"],
                ytd-browse[page-subtype="subscriptions"],
                ytd-browse[page-subtype="channels"])
                ytd-rich-item-renderer .yt-lockup-metadata-view-model__title,
            :is(ytd-browse[page-subtype="home"],
                ytd-browse[page-subtype="subscriptions"],
                ytd-browse[page-subtype="channels"])
                ytd-rich-item-renderer .ytLockupMetadataViewModelTitle,
            ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #video-title,
            .ytLockupMetadataViewModelTitle,
            .yt-lockup-metadata-view-model__title,
            .yt-lockup-metadata-view-model-wiz__title,
            #video-title,
            ytd-search ytd-video-renderer[is-search] a#video-title.ytd-video-renderer,
            ytd-search ytd-video-renderer[is-search] a#video-title.ytd-video-renderer yt-formatted-string {
                display: block !important;
                -webkit-line-clamp: initial !important;
                -webkit-box-orient: unset !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                white-space: normal !important;
            }
            ytd-rich-item-renderer .ytLockupMetadataViewModelTitle .ytAttributedStringHost,
            ytd-browse[page-subtype="channels"] ytd-rich-item-renderer .ytLockupMetadataViewModelTitle .ytAttributedStringHost,
            .ytLockupMetadataViewModelTitle .ytAttributedStringHost {
                display: block !important;
                -webkit-line-clamp: initial !important;
                -webkit-box-orient: unset !important;
                max-height: none !important;
                height: auto !important;
                overflow: visible !important;
                white-space: normal !important;
            }
            .ytLockupMetadataViewModelHeadingReset,
            .yt-lockup-metadata-view-model__heading-reset,
            ytd-grid-video-renderer h3 {
                display: block !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                margin-bottom: 4px !important;
            }
            .ytLockupMetadataViewModelTextContainer,
            .yt-lockup-metadata-view-model__text-container {
                display: flex !important;
                flex-direction: column !important;
                height: auto !important;
                max-height: none !important;
            }
            .ytLockupMetadataViewModelMetadata,
            .yt-lockup-metadata-view-model__metadata,
            ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #metadata-line,
            ytd-browse[page-subtype="channels"] ytd-grid-video-renderer #metadata-container,
            ytd-search ytd-video-renderer ytd-video-meta-block {
                position: relative !important;
                display: block !important;
                margin-top: 5px !important;
                clear: both !important;
                height: auto !important;
            }
            .yt-lockup-view-model--vertical,
            .yt-horizontal-list-renderer yt-lockup-view-model,
            ytd-grid-video-renderer {
                height: auto !important;
                min-height: 0 !important;
            }
        `;
  }

  // === SHOW FULL CHANNEL NAMES ===
  if (showFullChannelNames === 1) {
    css += `
            .yt-content-metadata-view-model__metadata-row:first-of-type .yt-core-attributed-string,
            .yt-content-metadata-view-model__metadata-row:first-of-type .yt-core-attributed-string a,
            .yt-content-metadata-view-model__metadata-row:first-of-type .yt-core-attributed-string span {
                max-height: none !important;
                -webkit-line-clamp: initial !important;
                height: auto !important;
                overflow: visible !important;
                white-space: normal !important;
            }
        `;
  }

  // ============================================================
  // INJECT CSS
  // ============================================================
  if (typeof GM_addStyle === "function") {
    const scriptVersion =
      typeof GM_info !== "undefined" && GM_info.script
        ? GM_info.script.version
        : "N/A";
    GM_addStyle(css);
    console.log(
      `YouTube Layout Script: v${scriptVersion} Active (${desiredColumnCount} Cols)`,
    );
  } else {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ============================================================
  // HOME-PAGE CLASS TOGGLE (replaces ytd-app:has(...) selector)
  // ============================================================
  function updateHomeClass() {
    document.documentElement.classList.toggle(
      "gm-home",
      window.location.pathname === "/",
    );
  }
  window.addEventListener("yt-navigate-finish", updateHomeClass);
  updateHomeClass();

  // ============================================================
  // DOM CLEANUP: consolidated + debounced
  // ============================================================
  const seenAdSections = new WeakSet();
  let shortsChipHidden = false;
  let scheduled = false;

  function cleanupSearchAds() {
    document
      .querySelectorAll("ytd-item-section-renderer")
      .forEach((section) => {
        if (seenAdSections.has(section)) return;
        seenAdSections.add(section);
        const hasAd = section.querySelector("ytd-ad-slot-renderer");
        const hasVideo = section.querySelector("ytd-video-renderer");
        if (hasAd && !hasVideo) section.remove();
      });
  }

  function cleanupStuckSpinners() {
    document
      .querySelectorAll("ytd-continuation-item-renderer")
      .forEach((spinner) => {
        const next = spinner.nextElementSibling;
        if (
          next &&
          next.tagName.toLowerCase() === "ytd-item-section-renderer"
        ) {
          spinner.remove();
        }
      });
  }

  function hideShortsChip() {
    if (shortsChipHidden) return;
    const chips = document.querySelectorAll("yt-chip-cloud-chip-renderer");
    for (const chip of chips) {
      if (chip.innerText.trim() === "Shorts") {
        chip.style.setProperty("display", "none", "important");
        shortsChipHidden = true;
        return;
      }
    }
  }

  function runCleanup() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (window.location.pathname === "/results") {
        cleanupSearchAds();
        cleanupStuckSpinners();
      }
      if (hideUnwantedContent === 1) {
        hideShortsChip();
      }
    });
  }

  // Reset per-page caches on navigation (chips/sections are re-created)
  window.addEventListener("yt-navigate-finish", () => {
    shortsChipHidden = false;
    runCleanup();
  });

  // Observer scoped to page manager (cheaper than body-wide)
  const observeTarget =
    document.querySelector("#page-manager") ||
    document.querySelector("#content") ||
    document.body;

  const observer = new MutationObserver(runCleanup);
  observer.observe(observeTarget, { childList: true, subtree: true });

  // Initial run
  runCleanup();
})();
