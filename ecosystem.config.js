module.exports = {
	deploy: {
		production: {
			user: "root",
			host: "64.226.74.250",
			ref: "origin/main",
			repo: "git@github.com:HeroGroup/1qma-backend.git",
			path: "/root/projects/sources/1qma",
			"pre-deploy": "git reset --hard",
			"post-deploy":
				"npm install; pm2 startOrRestart ~/projects/config/1qma.json --update-env --env production; pm2 save",
		},
		staging: {
			user: "root",
			host: "64.226.74.250",
			ref: "origin/dev",
			repo: "git@github.com:HeroGroup/1qma-backend.git",
			path: "/root/projects/sources/staging.1qma",
			"pre-deploy": "git reset --hard",
			"post-deploy":
				"npm install; pm2 startOrRestart ~/projects/config/staging.1qma.json --update-env --env production; pm2 save",
		},
	},
};
