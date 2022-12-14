const BlogPost = (sequelize, DataTypes) => {
  const BlogPost = sequelize.define(
    "BlogPost",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.STRING, allowNull: false },
      userId: { type: DataTypes.INTEGER, foreignKey: true },
      published: { type: DataTypes.DATE, allowNull: false },
      updated: { type: DataTypes.DATE, allowNull: false },
    },
    {
      timestamps: false,
    }
  );

  BlogPost.associate = (models) => {
    BlogPost.belongsTo(models.User, { foreignKey: "id", as: "users" });
  };

  return BlogPost;
};

module.exports = BlogPost;
