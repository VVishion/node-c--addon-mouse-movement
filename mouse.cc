#include <chrono>
#include <thread>
#include <napi.h>

#include <Windows.h>

#include <iostream>

using namespace Napi;

std::thread nativeThread;
ThreadSafeFunction tsfn;

Value Start(const CallbackInfo &info)
{
	Napi::Env env = info.Env();

	if (!info[0].IsFunction())
	{
		throw TypeError::New(env, "Expected first arg to be function");
	}

	// Create a ThreadSafeFunction
	tsfn = ThreadSafeFunction::New(
			env,
			info[0].As<Function>(), // JavaScript function called asynchronously
			"Resource Name",				// Name
			0,											// Unlimited queue
			1,											// Only one thread will use this initially
			[](Napi::Env) {					// Finalizer used to clean threads up
				nativeThread.join();
			});

	// Create a native thread
	nativeThread = std::thread([] {
		auto callback = [](Napi::Env env, Function jsCallback, POINT *p) {
			// Transform native data into JS data, passing it to the provided
			// `jsCallback` -- the TSFN's JavaScript function.
			
      Napi::Array obj = Napi::Array::New(env, uint32_t(2));
      obj.Set(uint32_t(0), p->x);
      obj.Set(uint32_t(1), p->y);
			
			jsCallback.Call({ obj });

			// We're finished with the data.
		};

		while(true)
		{
			POINT p;
			if (GetCursorPos(&p))
      {
				napi_status status = tsfn.BlockingCall(&p, callback);
				if (status != napi_ok)
				{
					// Handle error
					break;
				}
			}
			std::this_thread::sleep_for(std::chrono::milliseconds(16));
		}

		// Release the thread-safe function
		tsfn.Release();
	});

	return Boolean::New(env, true);
}

Napi::Object Init(Napi::Env env, Object exports)
{
	exports.Set("start", Function::New(env, Start));
	return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)