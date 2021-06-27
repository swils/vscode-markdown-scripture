# Markdown Scripture <!-- omit in toc -->

[![Build Status](https://travis-ci.com/swils/vscode-markdown-scripture.svg?branch=master)](https://travis-ci.com/swils/vscode-markdown-scripture)

Allow your Markdown notes in VS Code to track references and include quotes from verse-based documents such as the Bible.

## Table of Contents <!-- omit in toc -->

- [Features](#features)
  - [Referencing and including verses](#referencing-and-including-verses)
  - [Full compatibility with Markdown syntax](#full-compatibility-with-markdown-syntax)
- [Documentation](#documentation)
  - [Annotating source texts](#annotating-source-texts)
  - [Specifying the location of your source files](#specifying-the-location-of-your-source-files)
- [Future plans](#future-plans)
- [Issues](#issues)
- [Release Notes](#release-notes)

## Features

Git + Markdown + VS Code (+ the many excellent VS Code extensions for enhanced Markdown) is a powerful combination of tools for keeping notes on any topic.

With the **Markdown Scripture** extension, you can easily reference and include scriptural verses in your Markdown notes.

### Referencing and including verses

Referencing verses is very simple, using a mostly familiar format of `?[jn#3:16-17]`. For inclusion instead of passive reference, use an exclamation mark: `![jn#3:16-17]`. Multiple ranges can be specified: `?[jn#2:1,4-5]`. When a reference cannot be resolved, it is displayed with distinctive markup.

![image](docs/references.gif)

### Full compatibility with Markdown syntax

All other Markdown markup remains available. For instance, you can use tables to compare multiple translations or to place multiple synoptic Gospels side by side:

![image](docs/table.gif)

## Documentation

### Annotating source texts

For now, you need to provide your own source texts (see [Future plans](#future-plans)). These can be placed at any location inside the VS Code project/workspace where you keep your Markdown notes.

Your source files are also just Markdown text documents, but with annotations for chapters and verses. The annotation format was chosen to be lightweight and in line with typical Markdown conventions. (The format may change in the future to support new features and edge cases.)

Chapters are marked with HTML comment tags of the form `<!-- scripture:... -->`. For instance:

```markdown
## Chapter 2 <!-- scripture:2 -->
```

When Markdown Scripture encounters an annotation like this, it understands that any verses it encounters, from this point until the next chapter marker or until the end of the document, is part of chapter 2 of this document.

The beginning of a verse is marked inline inside regular text paragraphs, using rectangular brackets `[` and `]`. A verse runs until the next verse marker or until the end of the paragraph:

```markdown
## Chapter 2 <!-- scripture:2 -->

[1] And the third day, there was a marriage in Cana of Galilee: and the mother of Jesus was there. [2] And Jesus also was invited, and his disciples, to the marriage. [3] And the wine failing, the mother of Jesus saith to him: They have no wine.
```

Many source texts for translations can be downloaded from the web and annotated using VS Code's powerful regex find-and-replace support. A scripture pack may be released separately in the future (again, see [Future plans](#future-plans)).

### Specifying the location of your source files

It was already mentioned that it's entirely up to you where to place your source files inside your project. It is recommended however that you keep texts belonging to the same translation within the same folder. For instance `sources/dr1899/*.md` for Douay-Rheims and `sources/can1939/*.md` for Petrus Canisius.

You can then configure the extension in your `.vscode/settings.json` config using the `markdownScripture.sources` configuration setting. For instance:

```json
{
  "markdownScripture.sources": [
    { "include": "sources/can1939/*.md", "ref": "can1939/${filename}" },
    { "include": "sources/dr1899/*.md", "ref": "dr1899/${filename}" },
    { "include": "sources/dr1899/*.md", "ref": "${filename}" }
  ]
}
```

In this example, Markdown Scripture is instructed to scan two distinct folders for source documents, matching the glob pattern specified with the `include` keys. The filenames of the matched files can be used for reference construction (the `ref` keys). In the example, the files matching the glob pattern `sources/dr1899/*.md` will be made available in two ways. A single file named `jn.md` placed in folder `sources/dr1899` will be matched and, when parsed successfully, can therefore be referenced in your notes in two ways:

1. using `?[jn#2:1]`;
2. or more qualified as `?[dr1899/jn#2:1]`.

If you have a file called `jn.md` in folder `sources/can1939` of your project, containing a different translation of the same book, the above configuration allows this to be referenced in only one way, namely `?[can1939/jn#2:1]`.

## Future plans

* **Clickable links**.

  Clicking your references should open the original text to which the reference links.

* **Note templates**.

  Given a pericope (or any given range of verses), it would handy to automatically create the scaffolding for a verse-by-verse commentary on that pericope, using a fixed template.

* **Support for Scripture packs**.

  Currently, you have to manually add Bible texts in your Markdown notes and annotate chapters and verses. Even though this is not hard (given VSCode's support for regex-based find-and-replace), I have plans to create support for "Scripture packs". Ideally, it would then be possible to install a number of Bibles directly from the VSCode marketplace.

* **Support for a broader set of classical documents**.

  Markdown Scripture depends on a text having small enough parts which are numbered (verses or paragraphs), to allow referencing and inclusion. Next to the Bible there are other texts (e.g. the Summa Theologica or the Catechism) which Markdown Scripture could also support. This requires a more general annotation system which goes beyond chapters and verses.

* **Integration with other Markdown extensions**.

  The VSCode marketplace has a number of very nice extensions for general cross-referencing across notes, with support for `[[wiki-links]]`, backlinks and `#tags`. It would be cool if the Scripture references are integrated with e.g. the backlinks mechanism of the most popular extensions.

... given enough time :-)

## Issues

Issues with this extension can be reported here:

* [https://github.com/swils/vscode-markdown-scripture/issues](https://github.com/swils/vscode-markdown-scripture/issues)

Before reporting an issue, make sure to check whether the issue has already been reported.

## Release Notes

### 0.0.1 <!-- omit in toc -->

Initial release of Markdown Scripture.