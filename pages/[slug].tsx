import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import * as contentful from "contentful";

type ContentfulPage = {
  title: string;
  description: string;
};

type PageProps = {
  slug: string;
  data: contentful.EntryCollection<ContentfulPage>;
};

function createContentfulClient() {
  return contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_SPACE_ACCESS_TOKEN,
  });
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const client = createContentfulClient();
  const slug = context.params.slug as string;

  const data = await client.getEntries<ContentfulPage>({
    content_type: "page",
    "fields.slug": slug,
    include: 10,
  });

  if (!data.items.length) {
    throw new Error("This page does not exist.");
  }

  if (data.items.length > 1) {
    throw new Error("This page is ambiguous.");
  }

  return {
    props: { slug, data },
    revalidate: 10,
  };
};

const Page: NextPage<PageProps> = (props) => {
  const fields = props.data.items[0].fields;

  // return <pre>{JSON.stringify(props, null, 2)}</pre>;

  return (
    <div>
      <h1>{fields.title}</h1>
      <p>{fields.description}</p>
    </div>
  );
};

export default Page;
