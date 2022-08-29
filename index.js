import { readFileSync, writeFileSync } from 'fs'
import fetch from 'node-fetch'

const main = async () => {
  const data = JSON.parse(readFileSync('./records.json'))

  const topicCategories = []

  for (const entry of data) {
    const { cred, topicId } = entry

    const topicUrl = `https://forum.makerdao.com/t/${topicId}.json`

    console.log(topicId)

    const res = await fetch(topicUrl)
    const topic = await res.json()
    const category = topic.category_id

    const foundCategory = topicCategories.find(
      (cat) => cat.category === category
    )
    if (!foundCategory) topicCategories.push({ category, cred })
    else foundCategory.cred += cred
  }

  console.log(topicCategories)
  writeFileSync('./categories.json', JSON.stringify(topicCategories, null, 2))

  const sortedCategories = (
    await Promise.all(
      topicCategories.map(async (cat) => {
        const forumRes = await fetch(
          `https://forum.makerdao.com/c/${cat.category}/show.json`
        )
        const forumData = await forumRes.json()

        return { category: forumData.category.name, cred: cat.cred }
      })
    )
  )
    .sort((a, b) => b.cred - a.cred)
    .slice(0, 5)

  console.log(sortedCategories)
}

main()
