import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Production-ready",
    Svg: require("@site/static/img/undraw_sync.svg").default,
    description: (
      <>
        The starter is battle-tested and used in production by many companies.
      </>
    ),
  },
  {
    title: "Developer experience + Productivity",
    Svg: require("@site/static/img/undraw_mobile_development.svg").default,
    description: (
      <>
        The starter is designed to help you focus on your product and provide a
        set of tools and configuration that will help you to be more productive.
      </>
    ),
  },
  {
    title: "Minimal code and dependencies",
    Svg: require("@site/static/img/undraw_app_installation.svg").default,
    description: (
      <>
        we only use the minimum amount of code and dependencies to help take you
        control of your project.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
