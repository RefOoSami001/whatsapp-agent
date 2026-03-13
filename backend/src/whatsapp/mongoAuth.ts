import { LocalAuth } from "whatsapp-web.js";
import { Instance } from "../models/Instance";

export class MongoDBAuth extends LocalAuth {
  private instanceId: string;
  public session: any;

  constructor(instanceId: string) {
    super();
    this.instanceId = instanceId;
  }

  beforeBrowserInitialized = async () => {
    // Load session data from MongoDB instead of file
    const instance = await Instance.findById(this.instanceId);
    if (instance?.sessionData) {
      this.session = instance.sessionData;
    }
  };

  afterBrowserInitialized = async () => {
    // Save session data to MongoDB
    await this.saveSessionData();
  };

  onAuthenticationSuccess = async () => {
    // Save on success
    await this.saveSessionData();
  };

  onAuthenticationFailure = async () => {
    // Clear on failure
    await Instance.findByIdAndUpdate(this.instanceId, {
      sessionData: null,
      status: "error"
    });
  };

  logout = async () => {
    // Clear on logout
    await Instance.findByIdAndUpdate(this.instanceId, {
      sessionData: null,
      status: "stopped"
    });
  };

  private async saveSessionData() {
    try {
      if (this.session) {
        await Instance.findByIdAndUpdate(this.instanceId, {
          sessionData: this.session,
          status: "connected"
        });
      }
    } catch (error) {
      console.error("Error saving session data:", error);
    }
  }
}