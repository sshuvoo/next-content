import matter from 'gray-matter'
import yaml from 'js-yaml'

export function parseContent<T>(rawContent: string) {
  const { data, content } = matter(rawContent, {
    engines: {
      yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
    },
  })

  return { props: data as T, content }
}
