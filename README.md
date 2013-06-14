git-repo
========

A local git repository using any pluggable backend.

## Commit

```
{
  hash: hash,
  commit: {
    tree: hash
    key: [value1, value2, ...]
    key2: [value1, value2, ...]
    ...
    message: message
  }
}
```

## Tree

```
{
  hash: hash,
  tree: source<{ mode: mode, path: path, hash: hash }>
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
    tree: hash
    key: [value1, value2, ...]
    key2: [value1, value2, ...]
    ...
    message: message
  }
}
```
