#ifndef GRADIDO_LOGIN_SERVER_CONTROLLER_HEDERA_ACCOUNT_INCLUDE
#define GRADIDO_LOGIN_SERVER_CONTROLLER_HEDERA_ACCOUNT_INCLUDE

#include "../controller/HederaId.h"
#include "../model/table/HederaAccount.h"

#include "Poco/SharedPtr.h"

#include "TableControllerBase.h"

namespace controller {
	class HederaAccount : public TableControllerBase
	{
	public:
		~HederaAccount();

		static Poco::AutoPtr<HederaAccount> create(int user_id, int account_hedera_id, int account_key_id, Poco::UInt64 balance = 0, model::table::HederaNetworkType type = model::table::HEDERA_MAINNET);

		static std::vector<Poco::AutoPtr<HederaAccount>> load(const std::string& fieldName, int fieldValue);
		static std::vector<Poco::AutoPtr<HederaAccount>> listAll();

		inline bool deleteFromDB() { return mDBModel->deleteFromDB(); }

		inline Poco::AutoPtr<model::table::HederaAccount> getModel() { return _getModel<model::table::HederaAccount>(); }

		inline void setHederaId(Poco::AutoPtr<controller::HederaId> hederaId) { mHederaID = hederaId; }
		inline Poco::AutoPtr<controller::HederaId> getHederaId() { return mHederaID; }

	protected:
		HederaAccount(model::table::HederaAccount* dbModel);
		Poco::AutoPtr<controller::HederaId> mHederaID;

	};
}

#endif //GRADIDO_LOGIN_SERVER_CONTROLLER_HEDERA_ACCOUNT_INCLUDE