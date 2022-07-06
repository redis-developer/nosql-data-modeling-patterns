import asyncio
from datetime import datetime
from typing import List, Optional
from aredis_om import Field, connections, JsonModel, EmbeddedJsonModel
from aredis_om.model import Migrator
from utils import Base


class Revision(EmbeddedJsonModel):
    title: str = Field(index=True)
    body: str = Field(index=True)
    author: str = Field(index=True)
    last_saved_by: str = Field(index=True)
    created_at: datetime.date = Field(index=True)
    updated_at: datetime.date = Field(index=True)


class Post(JsonModel):
    title: str = Field(index=True)
    body: str = Field(index=True)
    author: str = Field(index=True)
    last_saved_by: Optional[str] = Field(index=True)
    created_at: Optional[datetime.date] = Field(index=True)
    updated_at: datetime.date = Field(index=True)
    revisions: Optional[List[Revision]]


async def create_post(**args):
    dt = datetime.now().isoformat()
    post = Post(
        title=args["title"],
        body=args["body"],
        author=args["author"],
        last_saved_by=args["last_saved_by"],
        created_at=dt,
        updated_at=dt,
        revisions=[]
    )

    return await post.save()


async def update_post(id: str, **args):
    post = await Post.get(id)
    revision = Revision(
        title=post.title,
        body=post.body,
        author=post.author,
        last_saved_by=post.last_saved_by,
        created_at=post.created_at,
        updated_at=post.updated_at)

    post.revisions.insert(0, revision)
    post.title = args.get("title", post.title)
    post.body = args.get("body", post.body)
    post.author = args.get("author", post.author)
    post.last_saved_by = args.get("last_saved_by", post.last_saved_by)
    post.updated_at = datetime.now().isoformat()

    return await post.save()

async def get_posts():
    results = await connections \
        .get_redis_connection() \
        .execute_command(
            f'FT.SEARCH {Post.Meta.index_name} * LIMIT 0 10 RETURN 5 title body author created_at updated_at'
        )

    return Post.from_redis(results)

async def get_post(id: str):
    return await Post.get(id)
