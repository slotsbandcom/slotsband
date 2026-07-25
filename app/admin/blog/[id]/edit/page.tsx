"use client"
import { useParams } from "next/navigation"
import { BlogPostForm } from "../../_BlogPostForm"

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>()
  return <BlogPostForm postId={id} />
}
