# Sources <!-- omit in toc -->

## Table of contents <!-- omit in toc -->

- [Filename conventions](#filename-conventions)
- [Included sources](#included-sources)
  - [Douay-Rheims-Challoner (`en/drc`)](#douay-rheims-challoner-endrc)

## Filename conventions

A fixed convention is proposed for Bible book filenames, regardless of language or translation. A separate mechanism to customize and localize references to these books will be provided later. The books and their respective filename are given in the following table:

| Filename    | Code     | Book                                   |
|-------------|----------|----------------------------------------|
| `1chron.md` | `1chron` | 1 Chronicles                           |
| `1cor.md`   | `1cor`   | 1 Corinthians                          |
| `1john.md`  | `1john`  | 1 John                                 |
| `1kings.md` | `1kings` | 1 Kings                                |
| `1macc.md`  | `1macc`  | 1 Maccabees                            |
| `1pet.md`   | `1pet`   | 1 Peter                                |
| `1sam.md`   | `1sam`   | 1 Samuel                               |
| `1thess.md` | `1thess` | 1 Thessalonians                        |
| `1tim.md`   | `1tim`   | 1 Timothy                              |
| `2chron.md` | `2chron` | 2 Chronicles                           |
| `2cor.md`   | `2cor`   | 2 Corinthians                          |
| `2john.md`  | `2john`  | 2 John                                 |
| `2kings.md` | `2kings` | 2 Kings                                |
| `2macc.md`  | `2macc`  | 2 Maccabees                            |
| `2pet.md`   | `2pet`   | 2 Peter                                |
| `2sam.md`   | `2sam`   | 2 Samuel                               |
| `2thess.md` | `2thess` | 2 Thessalonians                        |
| `2tim.md`   | `2tim`   | 2 Timothy                              |
| `3john.md`  | `3john`  | 3 John                                 |
| `acts.md`   | `acts`   | Acts of the Apostles                   |
| `amos.md`   | `amos`   | Amos                                   |
| `bar.md`    | `bar`    | Baruch                                 |
| `col.md`    | `col`    | Colossians                             |
| `dan.md`    | `dan`    | Daniel                                 |
| `deut.md`   | `deut`   | Deuteronomy                            |
| `eccles.md` | `eccles` | Ecclesiastes                           |
| `eph.md`    | `eph`    | Ephesians                              |
| `est.md`    | `est`    | Esther                                 |
| `ex.md`     | `ex`     | Exodus                                 |
| `ezek.md`   | `ezek`   | Ezekiel                                |
| `ezra.md`   | `ezra`   | Ezra                                   |
| `gal.md`    | `gal`    | Galatians                              |
| `gen.md`    | `gen`    | Genesis                                |
| `hab.md`    | `hab`    | Habakkuk                               |
| `hag.md`    | `hag`    | Haggai                                 |
| `heb.md`    | `heb`    | Hebrews                                |
| `hos.md`    | `hos`    | Hosea                                  |
| `isa.md`    | `isa`    | Isaiah                                 |
| `james.md`  | `james`  | James                                  |
| `jer.md`    | `jer`    | Jeremiah                               |
| `job.md`    | `job`    | Job                                    |
| `joel.md`   | `joel`   | Joel                                   |
| `john.md`   | `john`   | Gospel of John                         |
| `jonah.md`  | `jonah`  | Jonah                                  |
| `josh.md`   | `josh`   | Joshua                                 |
| `jth.md`    | `jth`    | Judith                                 |
| `jude.md`   | `jude`   | Jude                                   |
| `judg.md`   | `judg`   | Judges                                 |
| `lam.md`    | `lam`    | Lamentations                           |
| `lev.md`    | `lev`    | Leviticus                              |
| `luke.md`   | `luke`   | Gospel of Luke                         |
| `mal.md`    | `mal`    | Malachi                                |
| `mark.md`   | `mark`   | Gospel of Mark                         |
| `matt.md`   | `matt`   | Gospel of Matthew                      |
| `mic.md`    | `mic`    | Micah                                  |
| `nah.md`    | `nah`    | Nahum                                  |
| `neh.md`    | `neh`    | Nehemiah                               |
| `num.md`    | `num`    | Numbers                                |
| `obad.md`   | `obad`   | Obadiah                                |
| `phil.md`   | `phil`   | Philippians                            |
| `philem.md` | `philem` | Philemon                               |
| `prov.md`   | `prov`   | Proverbs                               |
| `ps.md`     | `ps`     | Psalms                                 |
| `rev.md`    | `rev`    | Revelation                             |
| `rom.md`    | `rom`    | Romans                                 |
| `ruth.md`   | `ruth`   | Ruth                                   |
| `sir.md`    | `sir`    | Wisdom of Sirach (Ecclesiasticus)      |
| `song.md`   | `song`   | Song of Songs  (Canticle of Canticles) |
| `titus.md`  | `titus`  | Titus                                  |
| `tob.md`    | `tob`    | Tobit                                  |
| `wisdom.md` | `wisdom` | Wisdom of Solomon                      |
| `zech.md`   | `zech`   | Zechariah                              |
| `zeph.md`   | `zeph`   | Zephaniah                              |

## Included sources

### Douay-Rheims-Challoner (`en/drc`)

* Source: [http://www.sacredbible.org/challoner/index.htm](http://www.sacredbible.org/challoner/index.htm)
* Language: English

This is a Catholic Bible from the 18th Century, falling under the public domain.

Example configuration:

```json
{
  // ...other config...
  "markdownScripture.sources": [
    { "extension": "swils.markdown-scripture", "include": "en/drc", "ref": "${filename}" },
  ]
}
```