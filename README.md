git-repo
========

A local git repository using any pluggable backend.

## Commit

```
{
  hash: hash,
  commit: {
    parents: [parent1, parent2, ...]
    key: value
    key2: value2
    ...
    message: message
  }
}
```

## Tree

```
{
  hash: hash,
  tree: [
    { mode: mode, path: path, hash: hash }
    ...
  ]
}
```

## Blob

```
{
  hash: hash,
  blob: source<binary>
}
```

## Tag

```
{
  hash: hash,
  tag: {
    key: value
    key2: value2
    ...
    message: message
  }
}
```
