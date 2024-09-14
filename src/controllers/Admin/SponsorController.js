const Sponsor = require("../../models/Sponsor");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getSponsors = async () => {
	try {
		const sponsors = await Sponsor.find();

		return success("Sponsors retrieved successfully!", sponsors);
	} catch (e) {
		return handleException(e);
	}
};

exports.addSponsor = async (params, icon) => {
	try {
		const { name, link, order } = params;
		if (!name) {
			return fail("Invalid sponsor name!");
		}
		if (!link) {
			return fail("Invalid sponsor link!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const sponsor = new Sponsor({
			name,
			link,
			order: order || 0,
			icon: icon?.path || "",
			isActive: true,
			createdAt: moment(),
		});
		await sponsor.save();

		return success("Addedd successfully!", sponsor);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateSponsor = async (params, icon) => {
	try {
		const { id, name, link, order, isActive } = params;
		if (!id || !name || !link) {
			return fail("invalid parameters!");
		}

		let sponsor = await Sponsor.findById(id);

		if (icon && sponsor.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${sponsor.icon}`);
		}

		const iconPath = icon ? icon.path.replace("public/", "") : sponsor?.icon;

		sponsor = await Sponsor.findByIdAndUpdate(
			id,
			{ name, link, order, icon: iconPath, isActive },
			{ new: true }
		);

		return success("Updated successfully!", sponsor);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteSponsor = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid sponsor id!");
		}

		const sponsor = await Sponsor.findById(id);

		if (sponsor?.icon) {
			removeFile(`${__basedir}/public/${sponsor.icon}`);
		}

		await Sponsor.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
